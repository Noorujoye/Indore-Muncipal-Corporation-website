package com.imc.vms_backend.controller;

import com.imc.vms_backend.dto.InvoiceActionRequest;
import com.imc.vms_backend.services.InvoiceWorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/verifier/invoices")
@RequiredArgsConstructor
public class VerifierInvoiceController {

    private final InvoiceWorkflowService workflowService;

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(
            @PathVariable Long id,
            Authentication auth
    ) {
        workflowService.verifierApprove(id, auth.getName());
        return ResponseEntity.ok("Invoice verified successfully");
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(
            @PathVariable Long id,
            @Valid @RequestBody InvoiceActionRequest request,
            Authentication auth
    ) {
        workflowService.verifierReject(id, auth.getName(), request);
        return ResponseEntity.ok("Invoice rejected by verifier");
    }
}
