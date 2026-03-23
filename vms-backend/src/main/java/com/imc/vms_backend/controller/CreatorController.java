package com.imc.vms_backend.controller;

import com.imc.vms_backend.dto.PendingVendorResponse;
import com.imc.vms_backend.dto.CreatorVendorDetailResponse;
import com.imc.vms_backend.dto.RequestDecisionRequest;
import com.imc.vms_backend.dto.VendorDirectoryRow;
import com.imc.vms_backend.dto.VendorRejectionRequest;
import com.imc.vms_backend.entity.Vendor;
import com.imc.vms_backend.services.CreatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/creator")
@RequiredArgsConstructor
public class CreatorController {

    private final CreatorService creatorService;

    
    @GetMapping("/vendors/pending")
    public ResponseEntity<List<PendingVendorResponse>> getPendingVendors() {
        return ResponseEntity.ok(creatorService.getPendingVendors());
    }

    
    @GetMapping("/vendors")
    public ResponseEntity<List<VendorDirectoryRow>> getVendors() {
        return ResponseEntity.ok(creatorService.getVendorDirectory());
    }

    
    @GetMapping("/vendors/{vendorId}")
    public ResponseEntity<CreatorVendorDetailResponse> getVendorDetails(@PathVariable Long vendorId) {
        return ResponseEntity.ok(creatorService.getVendorDetails(vendorId));
    }

    @GetMapping("/vendors/{vendorId}/logo")
    public ResponseEntity<Resource> getVendorLogo(@PathVariable Long vendorId) {
        String contentType = creatorService.getVendorLogoContentType(vendorId);
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (contentType != null && !contentType.trim().isEmpty()) {
            try {
                mediaType = MediaType.parseMediaType(contentType);
            } catch (Exception ignored) {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(creatorService.getVendorLogo(vendorId));
    }

    public static class VendorStatusUpdateRequest {
        public Vendor.VendorStatus status;
    }

    
    @PostMapping("/vendors/{vendorId}/status")
    public ResponseEntity<?> updateVendorStatus(
            @PathVariable Long vendorId,
            @RequestBody VendorStatusUpdateRequest request) {
        creatorService.updateVendorStatus(vendorId, request == null ? null : request.status);
        return ResponseEntity.ok(new com.imc.vms_backend.dto.ApiResponse(true, "Vendor status updated"));
    }

    
    @PostMapping("/vendors/{vendorId}/approve")
    public ResponseEntity<?> approveVendor(@PathVariable Long vendorId) {
        creatorService.approveVendor(vendorId);
        return ResponseEntity.ok(new com.imc.vms_backend.dto.ApiResponse(true,
                "Vendor approved successfully. Credentials have been sent via email."));
    }

    
    @PostMapping("/vendors/{vendorId}/reset-credentials")
    public ResponseEntity<?> resetVendorCredentials(@PathVariable Long vendorId, Authentication auth) {
        creatorService.resetVendorCredentials(vendorId, auth == null ? null : auth.getName());
        return ResponseEntity.ok(new com.imc.vms_backend.dto.ApiResponse(true,
                "Vendor temporary password generated and sent via email."));
    }

    @PostMapping("/profile-update-requests/{requestId}/resolve")
    public ResponseEntity<?> resolveProfileUpdateRequest(
            @PathVariable Long requestId,
            @RequestBody(required = false) RequestDecisionRequest request,
            Authentication auth) {
        creatorService.resolveProfileUpdateRequest(requestId, auth == null ? null : auth.getName(), request);
        return ResponseEntity.ok(new com.imc.vms_backend.dto.ApiResponse(true, "Request resolved"));
    }

    @PostMapping("/profile-update-requests/{requestId}/reject")
    public ResponseEntity<?> rejectProfileUpdateRequest(
            @PathVariable Long requestId,
            @RequestBody(required = false) RequestDecisionRequest request,
            Authentication auth) {
        creatorService.rejectProfileUpdateRequest(requestId, auth == null ? null : auth.getName(), request);
        return ResponseEntity.ok(new com.imc.vms_backend.dto.ApiResponse(true, "Request rejected"));
    }

    
    @PostMapping("/vendors/{vendorId}/reject")
    public ResponseEntity<?> rejectVendor(
            @PathVariable Long vendorId,
            @RequestBody(required = false) VendorRejectionRequest request) {
        String reason = request == null ? null : request.getReason();
        creatorService.rejectVendor(vendorId, reason);
        return ResponseEntity.ok(new com.imc.vms_backend.dto.ApiResponse(true, "Vendor rejected successfully"));
    }
}
