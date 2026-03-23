package com.imc.vms_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class VendorRegistrationRequest {

    @NotBlank
    @Pattern(regexp = "^[A-Za-z0-9+_.-]+@(.+)$", message = "Invalid email format")
    private String email;

    @NotBlank
    private String firmType;

    @NotBlank
    private String firmName;

    @NotBlank
    @Pattern(regexp = "[A-Z]{5}[0-9]{4}[A-Z]{1}", message = "Invalid PAN format")
    private String panNumber;

    @NotBlank
    @Size(min = 15, max = 15, message = "GSTIN must be 15 characters")
    private String gstinNumber;

    @NotBlank
    private String addressLine;

    @NotBlank
    private String city;

    @NotBlank
    private String district;

    @NotBlank
    private String state;

    @NotBlank
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Pincode must be 6 digits")
    private String pincode;

    @NotBlank
    private String authorizedPersonName;

    @NotNull(message = "Date of Birth is required")
    private LocalDate authorizedPersonDob;

    @NotBlank
    private String authorizedPersonDesignation;

    @NotBlank
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid mobile number")
    private String mobile;

    @NotBlank
    @Pattern(regexp = "^\\d{12}$", message = "Aadhaar must be 12 digits")
    private String authorizedPersonAadhaar;

    @NotBlank
    private String bankIfsc;

    @NotBlank
    private String bankAccountNumber;
}
