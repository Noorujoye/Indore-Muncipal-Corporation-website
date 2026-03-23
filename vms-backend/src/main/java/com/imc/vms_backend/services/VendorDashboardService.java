package com.imc.vms_backend.services;

import com.imc.vms_backend.dto.VendorDashboardCountResponse;
import com.imc.vms_backend.entity.Invoice;
import com.imc.vms_backend.entity.Vendor;
import com.imc.vms_backend.exception.ApiException;
import com.imc.vms_backend.repository.InvoiceRepository;

import com.imc.vms_backend.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorDashboardService {

        private final VendorRepository vendorRepository;

        private final InvoiceRepository invoiceRepository;

        public VendorDashboardCountResponse getCounts(String email) {

                Vendor vendor = vendorRepository.findAll().stream()
                                .filter(v -> v.getUser().getEmail().equals(email))
                                .findFirst()
                                .orElseThrow(() -> new ApiException("Vendor not found"));

                long activeTenders = 0; 

                long pendingInvoices = invoiceRepository.countByVendorIdAndStatusIn(
                                vendor.getId(),
                                List.of(
                                                Invoice.InvoiceStatus.SUBMITTED,
                                                Invoice.InvoiceStatus.CREATOR_APPROVED,
                                                Invoice.InvoiceStatus.VERIFIER_APPROVED));

                long approvedInvoices = invoiceRepository.countByVendorIdAndStatusIn(
                                vendor.getId(),
                                List.of(
                                                Invoice.InvoiceStatus.READY_FOR_PAYMENT,
                                                Invoice.InvoiceStatus.PAID));

                long rejectedInvoices = invoiceRepository.countByVendorIdAndStatusIn(
                                vendor.getId(),
                                List.of(
                                                Invoice.InvoiceStatus.CREATOR_REJECTED,
                                                Invoice.InvoiceStatus.VERIFIER_REJECTED,
                                                Invoice.InvoiceStatus.APPROVER_REJECTED));

                return new VendorDashboardCountResponse(
                                activeTenders,
                                pendingInvoices,
                                approvedInvoices,
                                rejectedInvoices);
        }
}
