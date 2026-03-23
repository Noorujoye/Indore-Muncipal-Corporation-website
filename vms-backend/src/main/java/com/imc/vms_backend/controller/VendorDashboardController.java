package com.imc.vms_backend.controller;

import com.imc.vms_backend.dto.VendorDashboardCountResponse;
import com.imc.vms_backend.services.VendorDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendor/dashboard")
@RequiredArgsConstructor
public class VendorDashboardController {

    private final VendorDashboardService dashboardService;

    @GetMapping("/counts")
    public ResponseEntity<VendorDashboardCountResponse> getCounts(
            Authentication auth) {

        return ResponseEntity.ok(
                dashboardService.getCounts(auth.getName())
        );
    }
}
