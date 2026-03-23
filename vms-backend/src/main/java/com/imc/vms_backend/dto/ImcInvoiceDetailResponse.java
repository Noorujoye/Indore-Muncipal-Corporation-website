package com.imc.vms_backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ImcInvoiceDetailResponse {

    private Long invoiceId;

    private String vendorName;
    private String vendorEmail;

    private String vendorInvoiceNumber;
    private String tenderReferenceNumber;
    private String departmentName;

    private BigDecimal baseAmount;
    private BigDecimal cgst;
    private BigDecimal sgst;
    private BigDecimal totalAmount;

    private String currentStatus;

    private List<InvoiceTimelineStep> timeline;
}
