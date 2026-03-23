package com.imc.vms_backend.controller;

import com.imc.vms_backend.services.ImcDashboardCountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/creator/dashboard")
@RequiredArgsConstructor
public class CreatorDashboardCountController {

    private final ImcDashboardCountService service;

    @GetMapping("/counts")
    public ResponseEntity<?> getCounts(Authentication auth) {
        return ResponseEntity.ok(service.getCreatorCounts(auth.getName()));
    }
}
