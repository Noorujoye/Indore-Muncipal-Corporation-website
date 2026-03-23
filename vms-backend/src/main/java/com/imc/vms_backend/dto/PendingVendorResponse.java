package com.imc.vms_backend.dto;

import com.imc.vms_backend.entity.Vendor;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PendingVendorResponse {
    private Long id;
    private String email;

    private String firmType;
    private String firmName;

    private String panNumber;
    private String gstinNumber;

    private String authorizedPersonMobile;
    private String addressLine;
    private String city;
    private String district;
    private String state;
    private String pincode;

    private String bankIfsc;
    private String bankAccountNumber;

    private Vendor.VendorStatus status;
    private String rejectionReason;

    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
}
