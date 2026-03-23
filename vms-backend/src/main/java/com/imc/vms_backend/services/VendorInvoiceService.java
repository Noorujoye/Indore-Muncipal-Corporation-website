package com.imc.vms_backend.services;

import com.imc.vms_backend.dto.InvoiceRequest;
import com.imc.vms_backend.entity.*;
import com.imc.vms_backend.exception.ApiException;
import com.imc.vms_backend.repository.*;
import com.imc.vms_backend.util.GstCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VendorInvoiceService {

    private final VendorRepository vendorRepository;

    private final InvoiceRepository invoiceRepository;

    public Invoice submitInvoice(String email, InvoiceRequest request) {

        Vendor vendor = vendorRepository.findByUserEmail(email)
                .orElseThrow(() -> new ApiException("Vendor not found"));



        Invoice invoice = Invoice.builder()
                .vendor(vendor)
                .tenderReferenceNumber(request.getTenderReferenceNumber())
                .vendorInvoiceNumber(request.getVendorInvoiceNumber())
                .baseAmount(request.getBaseAmount())
                .cgstAmount(GstCalculator.cgst(request.getBaseAmount()))
                .sgstAmount(GstCalculator.sgst(request.getBaseAmount()))
                .totalAmount(GstCalculator.total(request.getBaseAmount()))
                .workDescription(request.getWorkDescription())
                .invoiceDate(request.getInvoiceDate())
                .status(Invoice.InvoiceStatus.SUBMITTED)
                .createdAt(LocalDateTime.now())
                .build();

        return invoiceRepository.save(invoice);
    }
}
