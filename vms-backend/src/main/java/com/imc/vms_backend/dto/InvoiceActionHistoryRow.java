package com.imc.vms_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InvoiceActionHistoryRow {

    private Long logId;
    private Long invoiceId;
    private String invoiceNumber;
    private String vendorName;
    private BigDecimal totalAmount;
    private String action;
    private String currentStatus;
    private LocalDateTime actionTimestamp;
    private String remarks;
}

