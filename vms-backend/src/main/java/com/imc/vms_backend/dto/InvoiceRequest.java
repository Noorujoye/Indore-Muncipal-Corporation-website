package com.imc.vms_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InvoiceRequest {

    @NotBlank
    private String vendorInvoiceNumber;

    @NotBlank
    private String tenderReferenceNumber;

    @NotNull
    private BigDecimal baseAmount;

    @NotNull
    private LocalDate invoiceDate;

    private String workDescription;
}
