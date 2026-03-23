package com.imc.vms_backend.services;

import com.imc.vms_backend.dto.ImcInvoiceQueueResponse;
import com.imc.vms_backend.entity.Invoice;
import com.imc.vms_backend.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImcDashboardService {

    private final InvoiceRepository invoiceRepository;

    
    public List<ImcInvoiceQueueResponse> getInvoiceQueue(Invoice.InvoiceStatus status) {

        List<Invoice> invoices = invoiceRepository.findByStatus(status);

        return invoices.stream()
                .map(inv -> new ImcInvoiceQueueResponse(
                        inv.getId(),
                        inv.getVendor().getFirmName(),
                        inv.getVendorInvoiceNumber(),
                        inv.getTenderReferenceNumber(),
                        inv.getTotalAmount(),
                        inv.getStatus().name(),
                        inv.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
}
