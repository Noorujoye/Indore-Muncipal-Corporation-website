package com.imc.vms_backend.dto;

import com.imc.vms_backend.entity.Vendor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatorVendorDetailResponse {

    private Long id;

    private String firmType;
    private String firmName;

    private String registrationNumber;
    private LocalDate registrationDate;
    private String msmeNumber;

    private String panNumber;
    private String gstinNumber;

    private String addressLine;
    private String city;
    private String district;
    private String state;
    private String pincode;

    private String authorizedPersonName;
    private LocalDate authorizedPersonDob;
    private String authorizedPersonDesignation;
    private String authorizedPersonMobile;
    private String authorizedPersonAadhaar;

    private String bankIfsc;
    private String bankAccountNumber;

    private Vendor.VendorStatus status;
    private String rejectionReason;

    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime updatedAt;

    private String email;
    private boolean hasLogo;

    private boolean hasPendingCredentialResetRequest;
    private LocalDateTime pendingCredentialResetRequestedAt;

    private Long pendingProfileUpdateRequestId;
    private String pendingProfileUpdateReason;
    private String pendingProfileUpdateDetails;
    private LocalDateTime pendingProfileUpdateRequestedAt;
}
