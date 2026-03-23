package com.imc.vms_backend.controller;

import com.imc.vms_backend.dto.InvoiceRequest;
import com.imc.vms_backend.services.VendorInvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendor/invoices")
@RequiredArgsConstructor
public class VendorInvoiceController {

    private final VendorInvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<?> submitInvoice(
            Authentication authentication,
            @Valid @RequestBody InvoiceRequest request
    ) {
        var invoice = invoiceService.submitInvoice(authentication.getName(), request);
        return ResponseEntity.ok(java.util.Map.of(
                "message", "Invoice submitted successfully",
                "invoiceId", invoice.getId()
        ));
    }
}
