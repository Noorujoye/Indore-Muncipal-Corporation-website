package com.imc.vms_backend.dto;

import com.imc.vms_backend.entity.Vendor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorProfileResponse {

    private Long id;
    private String firmName;
    private String firmType;

    private String email;
    private String mobile;

    private String panNumber;
    private String gstinNumber;

    private String authorizedPersonName;
    private String authorizedPersonDesignation;
    private String authorizedPersonAadhaar;

    private String addressLine;
    private String city;
    private String district;
    private String state;
    private String pincode;

    private String bankIfsc;
    private String bankAccountNumber;

    private Vendor.VendorStatus status;

    private boolean hasLogo;
}
