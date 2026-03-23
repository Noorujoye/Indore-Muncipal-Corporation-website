package com.imc.vms_backend.services;

import com.imc.vms_backend.dto.InvoiceReportFilterRequest;
import com.imc.vms_backend.dto.InvoiceReportRow;
import com.imc.vms_backend.entity.Invoice;
import com.imc.vms_backend.repository.InvoiceReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceReportService {

    private final InvoiceReportRepository reportRepository;

    public List<InvoiceReportRow> getInvoiceReport(
            InvoiceReportFilterRequest filter) {

        LocalDateTime from =
                filter.getFromDate() != null
                        ? filter.getFromDate().atStartOfDay()
                        : null;

        LocalDateTime to =
                filter.getToDate() != null
                        ? filter.getToDate().atTime(23, 59, 59)
                        : null;

        Invoice.InvoiceStatus status =
                filter.getStatus() != null
                        ? Invoice.InvoiceStatus.valueOf(filter.getStatus())
                        : null;

        List<Invoice> invoices =
                reportRepository.findInvoicesForReport(
                        filter.getVendorName(),
                        filter.getTenderReference(),
                        status,
                        from,
                        to
                );

        return invoices.stream()
                .map(i -> new InvoiceReportRow(
                        i.getId(),
                        i.getVendor().getFirmName(),
                        i.getVendorInvoiceNumber(),
                        i.getTenderReferenceNumber(),
                        i.getTotalAmount(),
                        i.getStatus().name(),
                        i.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
}
