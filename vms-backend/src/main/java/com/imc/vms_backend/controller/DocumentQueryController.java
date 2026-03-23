package com.imc.vms_backend.controller;

import com.imc.vms_backend.entity.Document;
import com.imc.vms_backend.entity.Invoice;
import com.imc.vms_backend.exception.ApiException;
import com.imc.vms_backend.repository.DocumentRepository;
import com.imc.vms_backend.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentQueryController {

    private final DocumentRepository documentRepository;
        private final InvoiceRepository invoiceRepository;

        private boolean isVendor(Authentication auth) {
                return auth != null && auth.getAuthorities() != null
                                && auth.getAuthorities().stream().anyMatch(a -> "ROLE_VENDOR".equals(a.getAuthority()));
        }

        private void assertVendorCanAccessInvoice(Authentication auth, Long invoiceId) {
                Invoice invoice = invoiceRepository.findById(invoiceId)
                                .orElseThrow(() -> new ApiException("Invoice not found"));

                String email = auth.getName();
                if (invoice.getVendor() == null
                                || invoice.getVendor().getUser() == null
                                || invoice.getVendor().getUser().getEmail() == null
                                || !invoice.getVendor().getUser().getEmail().equalsIgnoreCase(email)) {
                        throw new ApiException("Forbidden");
                }
        }

    @GetMapping("/{entityType}/{entityId}")
    public ResponseEntity<List<Document>> getDocuments(
            @PathVariable String entityType,
                        @PathVariable Long entityId,
                        Authentication auth
    ) {
                if (isVendor(auth)) {
                        if (!"INVOICE".equalsIgnoreCase(entityType)) {
                                throw new ApiException("Forbidden");
                        }
                        assertVendorCanAccessInvoice(auth, entityId);
                }
        return ResponseEntity.ok(
                documentRepository.findByEntityTypeAndEntityId(entityType, entityId)
        );
    }

    @GetMapping("/download/{documentId}")
        public ResponseEntity<Resource> download(
                        @PathVariable Long documentId,
                        Authentication auth
        ) {

        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ApiException("Document not found"));

                if (isVendor(auth)) {
                        if (!"INVOICE".equalsIgnoreCase(doc.getEntityType())) {
                                throw new ApiException("Forbidden");
                        }
                        assertVendorCanAccessInvoice(auth, doc.getEntityId());
                }

        File file = new File(doc.getFilePath());
        Resource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + doc.getFileName() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
