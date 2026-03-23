package com.imc.vms_backend.controller;

import com.imc.vms_backend.entity.Document;
import com.imc.vms_backend.entity.Invoice;
import com.imc.vms_backend.entity.User;
import com.imc.vms_backend.exception.ApiException;
import com.imc.vms_backend.repository.DocumentRepository;
import com.imc.vms_backend.repository.InvoiceRepository;
import com.imc.vms_backend.repository.UserRepository;
import com.imc.vms_backend.services.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Paths;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/vendor/invoices")
@RequiredArgsConstructor
public class VendorInvoiceDocumentController {

        private final FileStorageService storageService;
        private final DocumentRepository documentRepository;
        private final InvoiceRepository invoiceRepository;
        private final UserRepository userRepository;

        @PostMapping("/{invoiceId}/upload")
        public ResponseEntity<?> uploadInvoiceDocument(
                        @PathVariable Long invoiceId,
                        @RequestParam("file") MultipartFile file,
                        Authentication auth) {

                Invoice invoice = invoiceRepository.findById(invoiceId)
                                .orElseThrow(() -> new ApiException("Invoice not found"));

                if (invoice.getStatus() != Invoice.InvoiceStatus.DRAFT &&
                                invoice.getStatus() != Invoice.InvoiceStatus.SUBMITTED) {
                        throw new ApiException("Cannot upload document at this stage");
                }

                User user = userRepository.findByEmail(auth.getName())
                                .orElseThrow(() -> new ApiException("User not found"));

                if (invoice.getVendor() == null
                                || invoice.getVendor().getUser() == null
                                || invoice.getVendor().getUser().getEmail() == null
                                || !invoice.getVendor().getUser().getEmail().equalsIgnoreCase(user.getEmail())) {
                        throw new ApiException("Not allowed to upload documents for this invoice");
                }

                String path = storageService.storeFile(file, "invoices/" + invoiceId);

                String storedFileName = Paths.get(path).getFileName().toString();
                String originalFileName = file.getOriginalFilename();
                String downloadFileName = (originalFileName != null && !originalFileName.isBlank())
                                ? originalFileName
                                : storedFileName;

                Document doc = Document.builder()
                                .entityType("INVOICE")
                                .entityId(invoiceId)
                                .fileName(downloadFileName)
                                .filePath(path)
                                .fileType(file.getContentType())
                                .uploadedBy(user)
                                .uploadedAt(LocalDateTime.now())
                                .build();

                documentRepository.save(doc);

                return ResponseEntity.ok("Document uploaded successfully");
        }
}
