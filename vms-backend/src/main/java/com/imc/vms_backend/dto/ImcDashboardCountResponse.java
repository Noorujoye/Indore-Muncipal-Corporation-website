package com.imc.vms_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ImcDashboardCountResponse {

    private long pendingVendors;
    private long pendingInvoices;
    private long readyForPayment;

    
    private long forwardedToday;
    private long verifiedToday;
    private long approvedToday;
    private long rejectedToday;
    private long returnedForCorrection;
    private long forwardedToApprover;
}
