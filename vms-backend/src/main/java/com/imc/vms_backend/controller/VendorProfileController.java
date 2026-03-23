package com.imc.vms_backend.controller;

import com.imc.vms_backend.dto.ApiResponse;
import com.imc.vms_backend.dto.VendorProfileUpdateRequestCreateRequest;
import com.imc.vms_backend.dto.VendorProfileResponse;
import com.imc.vms_backend.services.VendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vendor/profile")
@RequiredArgsConstructor
public class VendorProfileController {

    private final VendorService vendorService;

    @GetMapping
    public ResponseEntity<VendorProfileResponse> me(Authentication auth) {
        return ResponseEntity.ok(vendorService.getMyProfile(auth.getName()));
    }

    @PostMapping("/update-request")
    public ResponseEntity<ApiResponse> requestProfileUpdate(
            Authentication auth,
            @Valid @RequestBody VendorProfileUpdateRequestCreateRequest request) {
        vendorService.createProfileUpdateRequest(auth.getName(), request);
        return ResponseEntity.ok(new ApiResponse(true, "Profile update request submitted"));
    }

    @GetMapping("/logo")
    public ResponseEntity<Resource> myLogo(Authentication auth) {
        String contentType = vendorService.getMyLogoContentType(auth.getName());
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
                .body(vendorService.getMyLogo(auth.getName()));
    }
}
