package com.imc.vms_backend.controller;

import com.imc.vms_backend.dto.*;
import com.imc.vms_backend.services.VendorInvoiceQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendor/invoices")
@RequiredArgsConstructor
public class VendorInvoiceQueryController {

    private final VendorInvoiceQueryService queryService;

    
    @GetMapping
    public ResponseEntity<List<VendorInvoiceListResponse>> getInvoices(
            Authentication auth) {

        return ResponseEntity.ok(
                queryService.getMyInvoices(auth.getName()));
    }

    
    @GetMapping("/{invoiceId}")
    public ResponseEntity<VendorInvoiceDetailResponse> getInvoiceDetail(
            @PathVariable Long invoiceId,
            Authentication auth) {

        return ResponseEntity.ok(
                queryService.getInvoiceDetail(auth.getName(), invoiceId));
    }
}
