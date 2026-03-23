package com.imc.vms_backend.controller;

import com.imc.vms_backend.dto.InvoiceActionRequest;
import com.imc.vms_backend.services.InvoiceWorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/creator/invoices")
@RequiredArgsConstructor
public class CreatorInvoiceController {

    private final InvoiceWorkflowService workflowService;

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(
            @PathVariable Long id,
            Authentication auth
    ) {
        workflowService.creatorApprove(id, auth.getName());
        return ResponseEntity.ok("Invoice approved by creator");
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(
            @PathVariable Long id,
            @Valid @RequestBody InvoiceActionRequest request,
            Authentication auth
    ) {
        workflowService.creatorReject(id, auth.getName(), request);
        return ResponseEntity.ok("Invoice rejected by creator");
    }
}
