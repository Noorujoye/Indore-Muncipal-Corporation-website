package com.imc.vms_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VendorProfileUpdateRequestCreateRequest {

    @NotBlank(message = "Reason is required")
    private String reason;

    @NotBlank(message = "Details are required")
    private String details;
}
