package com.imc.vms_backend.controller;

import com.imc.vms_backend.dto.VendorForgotPasswordRequest;
import com.imc.vms_backend.dto.VendorRegistrationRequest;
import com.imc.vms_backend.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {
    private final com.imc.vms_backend.services.VendorService vendorService;

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody VendorForgotPasswordRequest request) {
        vendorService.createForgotPasswordRequest(request.getEmail());
        return ResponseEntity.ok(new ApiResponse(true,
                "If this email is registered and active, you will receive a password reset link shortly."));
    }

    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerVendorJson(@Valid @RequestBody VendorRegistrationRequest request) {
        vendorService.registerVendor(request, null);
        return ResponseEntity.ok("Vendor registration submitted, Awaiting approval.");
    }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registerVendorMultipart(
            @Valid @RequestPart("data") VendorRegistrationRequest request,
            @RequestPart(value = "profilePhoto", required = false) MultipartFile profilePhoto) {
        vendorService.registerVendor(request, profilePhoto);
        return ResponseEntity.ok("Vendor registration submitted, Awaiting approval.");
    }
}
