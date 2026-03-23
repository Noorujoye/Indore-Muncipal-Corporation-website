package com.imc.vms_backend.controller;

import com.imc.vms_backend.dto.InvoiceActionRequest;
import com.imc.vms_backend.services.InvoiceWorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/approver/invoices")
@RequiredArgsConstructor
public class ApproverInvoiceController {

    private final InvoiceWorkflowService workflowService;

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(
            @PathVariable Long id,
            Authentication auth) {
        workflowService.approverApprove(id, auth.getName());
        return ResponseEntity.ok("Invoice approved for payment");
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(
            @PathVariable Long id,
            @Valid @RequestBody InvoiceActionRequest request,
            Authentication auth) {
        workflowService.approverReject(id, auth.getName(), request);
        return ResponseEntity.ok("Invoice rejected by approver");
    }

    @PostMapping("/{id}/mark-paid")
    public ResponseEntity<?> markPaid(
            @PathVariable Long id,
            Authentication auth) {
        workflowService.markPaid(id, auth.getName());
        return ResponseEntity.ok("Invoice marked as paid");
    }
}
