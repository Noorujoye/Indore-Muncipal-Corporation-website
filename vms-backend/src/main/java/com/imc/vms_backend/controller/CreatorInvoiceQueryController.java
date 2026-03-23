package com.imc.vms_backend.controller;

import com.imc.vms_backend.dto.ImcInvoiceDetailResponse;
import com.imc.vms_backend.services.ImcInvoiceQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/creator/invoices")
@RequiredArgsConstructor
public class CreatorInvoiceQueryController {

    private final ImcInvoiceQueryService queryService;

    @GetMapping("/{invoiceId}")
    public ResponseEntity<ImcInvoiceDetailResponse> getInvoiceDetail(
            @PathVariable Long invoiceId) {

        return ResponseEntity.ok(
                queryService.getInvoiceDetail(invoiceId)
        );
    }
}
