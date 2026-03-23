package com.imc.vms_backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class VendorInvoiceDetailResponse {

    private Long invoiceId;
    private String vendorInvoiceNumber;
    private String tenderReferenceNumber;

    private BigDecimal baseAmount;
    private BigDecimal cgst;
    private BigDecimal sgst;
    private BigDecimal totalAmount;

    private String status;

    private List<InvoiceTimelineStep> timeline;
}
