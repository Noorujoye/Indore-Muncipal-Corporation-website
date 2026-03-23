package com.imc.vms_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class VendorInvoiceListResponse {

    private Long invoiceId;
    private String vendorInvoiceNumber;
    private String tenderReferenceNumber;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;
}
