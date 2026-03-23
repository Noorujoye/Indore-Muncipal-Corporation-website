package com.imc.vms_backend.dto;

import com.imc.vms_backend.entity.Vendor;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class VendorDirectoryRow {

    private Long id;
    private String firmName;
    private String firmType;
    private String email;
    private Vendor.VendorStatus status;
    private LocalDateTime joinedAt;

    private boolean hasLogo;
}
