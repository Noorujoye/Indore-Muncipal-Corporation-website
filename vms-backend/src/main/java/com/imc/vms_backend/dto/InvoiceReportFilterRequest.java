package com.imc.vms_backend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class InvoiceReportFilterRequest {

    private String vendorName;     
    private String tenderReference;
    private String status;         

    private LocalDate fromDate;    
    private LocalDate toDate;      
}
