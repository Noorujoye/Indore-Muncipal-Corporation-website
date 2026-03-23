package com.imc.vms_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class InvoiceTimelineStep {

    private String stage;
    private String status;      
    private LocalDateTime actionTime;
    private String remarks;
}
