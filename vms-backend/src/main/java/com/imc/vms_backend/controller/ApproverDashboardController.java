package com.imc.vms_backend.controller;

import com.imc.vms_backend.dto.ImcInvoiceQueueResponse;
import com.imc.vms_backend.entity.Invoice;
import com.imc.vms_backend.services.ImcDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/approver/dashboard")
@RequiredArgsConstructor
public class ApproverDashboardController {

    private final ImcDashboardService dashboardService;

    @GetMapping("/invoices")
    public ResponseEntity<List<ImcInvoiceQueueResponse>> getInvoices() {
        return ResponseEntity.ok(
                dashboardService.getInvoiceQueue(
                        Invoice.InvoiceStatus.VERIFIER_APPROVED
                )
        );
    }
}
