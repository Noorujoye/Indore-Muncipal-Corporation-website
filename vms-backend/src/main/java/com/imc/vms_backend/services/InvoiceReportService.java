package com.imc.vms_backend.services;

import com.imc.vms_backend.dto.InvoiceActionHistoryRow;
import com.imc.vms_backend.dto.InvoiceReportFilterRequest;
import com.imc.vms_backend.dto.InvoiceReportRow;
import com.imc.vms_backend.entity.Invoice;
import com.imc.vms_backend.entity.InvoiceActionLog;
import com.imc.vms_backend.repository.InvoiceActionLogRepository;
import com.imc.vms_backend.repository.InvoiceReportRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceReportService {

    private final InvoiceReportRepository reportRepository;
    private final InvoiceActionLogRepository actionLogRepository;

    public List<InvoiceReportRow> getInvoiceReport(
            InvoiceReportFilterRequest filter) {

        LocalDateTime from = (filter != null && filter.getFromDate() != null)
                ? filter.getFromDate().atStartOfDay()
                : null;

        LocalDateTime to = (filter != null && filter.getToDate() != null)
                ? filter.getToDate().atTime(23, 59, 59)
                : null;

        Invoice.InvoiceStatus status = null;
        if (filter != null && filter.getStatus() != null && !filter.getStatus().isBlank()) {
            try {
                status = Invoice.InvoiceStatus.valueOf(filter.getStatus().trim());
            } catch (IllegalArgumentException ignored) {
                // Ignore invalid status filter
            }
        }

        final LocalDateTime finalFrom = from;
        final LocalDateTime finalTo = to;
        final Invoice.InvoiceStatus finalStatus = status;
        final String vendorName = (filter != null && filter.getVendorName() != null && !filter.getVendorName().isBlank())
                ? filter.getVendorName().trim() : null;
        final String tenderRef = (filter != null && filter.getTenderReference() != null && !filter.getTenderReference().isBlank())
                ? filter.getTenderReference().trim() : null;

        Specification<Invoice> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (vendorName != null) {
                predicates.add(cb.like(cb.lower(root.get("vendor").get("firmName")), "%" + vendorName.toLowerCase() + "%"));
            }
            if (tenderRef != null) {
                predicates.add(cb.like(cb.lower(root.get("tenderReferenceNumber")), "%" + tenderRef.toLowerCase() + "%"));
            }
            if (finalStatus != null) {
                predicates.add(cb.equal(root.get("status"), finalStatus));
            }
            if (finalFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), finalFrom));
            }
            if (finalTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), finalTo));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Invoice> invoices = reportRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));

        return invoices.stream()
                .map(i -> new InvoiceReportRow(
                        i.getId(),
                        i.getVendor() != null ? i.getVendor().getFirmName() : null,
                        i.getVendorInvoiceNumber(),
                        i.getTenderReferenceNumber(),
                        i.getTotalAmount(),
                        i.getStatus() != null ? i.getStatus().name() : null,
                        i.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    public List<InvoiceActionHistoryRow> getUserActionHistory(String email) {
        List<InvoiceActionLog> logs = actionLogRepository.findByActionBy_EmailOrderByActionTimestampDesc(email);
        return logs.stream().map(log -> {
            Invoice inv = log.getInvoice();
            String action;
            if (log.getToStatus() != null) {
                switch (log.getToStatus()) {
                    case CREATOR_APPROVED:
                        action = "Forwarded to Verifier";
                        break;
                    case VERIFIER_APPROVED:
                        action = "Verified & Forwarded";
                        break;
                    case READY_FOR_PAYMENT:
                        action = "Approved for Payment";
                        break;
                    case PAID:
                        action = "Marked as Paid";
                        break;
                    case CREATOR_REJECTED:
                    case VERIFIER_REJECTED:
                    case APPROVER_REJECTED:
                        action = "Rejected";
                        break;
                    default:
                        action = log.getToStatus().name();
                }
            } else {
                action = "Processed";
            }

            return InvoiceActionHistoryRow.builder()
                    .logId(log.getId())
                    .invoiceId(inv != null ? inv.getId() : null)
                    .invoiceNumber(inv != null ? inv.getVendorInvoiceNumber() : null)
                    .vendorName(inv != null && inv.getVendor() != null ? inv.getVendor().getFirmName() : null)
                    .totalAmount(inv != null ? inv.getTotalAmount() : null)
                    .action(action)
                    .currentStatus(inv != null && inv.getStatus() != null ? inv.getStatus().name() : null)
                    .actionTimestamp(log.getActionTimestamp())
                    .remarks(log.getRemarks())
                    .build();
        }).collect(Collectors.toList());
    }
}

