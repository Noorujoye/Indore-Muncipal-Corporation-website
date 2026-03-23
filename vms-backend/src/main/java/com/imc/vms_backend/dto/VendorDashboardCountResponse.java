package com.imc.vms_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VendorDashboardCountResponse {

    private long activeTenders;
    private long pendingInvoices;
    private long approvedInvoices;
    private long rejectedInvoices;
}
