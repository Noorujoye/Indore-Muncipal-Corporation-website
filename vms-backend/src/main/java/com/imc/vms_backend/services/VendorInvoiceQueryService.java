package com.imc.vms_backend.services;

import com.imc.vms_backend.dto.*;
import com.imc.vms_backend.entity.*;
import com.imc.vms_backend.exception.ApiException;
import com.imc.vms_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VendorInvoiceQueryService {

        private final VendorRepository vendorRepository;
        private final InvoiceRepository invoiceRepository;
        private final InvoiceActionLogRepository logRepository;

        
        public List<VendorInvoiceListResponse> getMyInvoices(String email) {

                Vendor vendor = vendorRepository.findAll().stream()
                                .filter(v -> v.getUser().getEmail().equals(email))
                                .findFirst()
                                .orElseThrow(() -> new ApiException("Vendor not found"));

                List<Invoice> invoices = invoiceRepository.findByVendorId(vendor.getId());

                
                invoices.sort(Comparator.comparing(this::isPending).reversed());

                return invoices.stream()
                                .map(inv -> new VendorInvoiceListResponse(
                                                inv.getId(),
                                                inv.getVendorInvoiceNumber(),
                                                inv.getTenderReferenceNumber(),
                                                inv.getTotalAmount(),
                                                inv.getStatus().name(),
                                                inv.getCreatedAt()))
                                .collect(Collectors.toList());
        }

        private boolean isPending(Invoice invoice) {
                return invoice.getStatus() != Invoice.InvoiceStatus.READY_FOR_PAYMENT
                                && invoice.getStatus() != Invoice.InvoiceStatus.PAID
                                && !invoice.getStatus().name().contains("REJECTED");
        }

        
        public VendorInvoiceDetailResponse getInvoiceDetail(
                        String email, Long invoiceId) {

                Vendor vendor = vendorRepository.findAll().stream()
                                .filter(v -> v.getUser().getEmail().equals(email))
                                .findFirst()
                                .orElseThrow(() -> new ApiException("Vendor not found"));

                Invoice invoice = invoiceRepository.findById(invoiceId)
                                .orElseThrow(() -> new ApiException("Invoice not found"));

                if (!invoice.getVendor().getId().equals(vendor.getId())) {
                        throw new ApiException("Unauthorized access to invoice");
                }

                List<InvoiceActionLog> logs = logRepository.findByInvoiceIdOrderByActionTimestampAsc(invoiceId);

                VendorInvoiceDetailResponse response = new VendorInvoiceDetailResponse();
                response.setInvoiceId(invoice.getId());
                response.setVendorInvoiceNumber(invoice.getVendorInvoiceNumber());
                response.setTenderReferenceNumber(invoice.getTenderReferenceNumber());

                response.setBaseAmount(invoice.getBaseAmount());
                response.setCgst(invoice.getCgstAmount());
                response.setSgst(invoice.getSgstAmount());
                response.setTotalAmount(invoice.getTotalAmount());
                response.setStatus(invoice.getStatus().name());

                response.setTimeline(buildTimeline(invoice, logs));

                return response;
        }

        
        protected List<InvoiceTimelineStep> buildTimeline(
                        Invoice invoice, List<InvoiceActionLog> logs) {

                List<String> stages = List.of(
                                "SUBMITTED",
                                "CREATOR_REVIEW",
                                "VERIFIER_REVIEW",
                                "APPROVER_REVIEW",
                                "READY_FOR_PAYMENT",
                                "PAID");

                Invoice.InvoiceStatus status = invoice.getStatus();
                boolean isRejected = status != null && status.name().contains("REJECTED");

                int currentStageIndex = -1;
                if (!isRejected) {
                        if (status == Invoice.InvoiceStatus.SUBMITTED)
                                currentStageIndex = 1;
                        else if (status == Invoice.InvoiceStatus.CREATOR_APPROVED)
                                currentStageIndex = 2;
                        else if (status == Invoice.InvoiceStatus.VERIFIER_APPROVED)
                                currentStageIndex = 3;
                        else if (status == Invoice.InvoiceStatus.READY_FOR_PAYMENT)
                                currentStageIndex = 4;
                        else if (status == Invoice.InvoiceStatus.PAID)
                                currentStageIndex = 5;
                }

                java.util.function.Function<Invoice.InvoiceStatus[], Optional<InvoiceActionLog>> findFirstTo = (
                                targets) -> logs.stream()
                                                .filter(l -> l.getToStatus() != null
                                                                && Arrays.asList(targets).contains(l.getToStatus()))
                                                .findFirst();

                Optional<InvoiceActionLog> submittedLog = logs.stream()
                                .filter(l -> l.getFromStatus() == null
                                                || l.getToStatus() == Invoice.InvoiceStatus.SUBMITTED)
                                .findFirst();
                Optional<InvoiceActionLog> creatorLog = findFirstTo.apply(new Invoice.InvoiceStatus[] {
                                Invoice.InvoiceStatus.CREATOR_APPROVED,
                                Invoice.InvoiceStatus.CREATOR_REJECTED
                });
                Optional<InvoiceActionLog> verifierLog = findFirstTo.apply(new Invoice.InvoiceStatus[] {
                                Invoice.InvoiceStatus.VERIFIER_APPROVED,
                                Invoice.InvoiceStatus.VERIFIER_REJECTED
                });
                Optional<InvoiceActionLog> approverLog = findFirstTo.apply(new Invoice.InvoiceStatus[] {
                                Invoice.InvoiceStatus.READY_FOR_PAYMENT,
                                Invoice.InvoiceStatus.APPROVER_REJECTED
                });
                Optional<InvoiceActionLog> readyLog = findFirstTo.apply(new Invoice.InvoiceStatus[] {
                                Invoice.InvoiceStatus.READY_FOR_PAYMENT
                });

                Optional<InvoiceActionLog> paidLog = findFirstTo.apply(new Invoice.InvoiceStatus[] {
                                Invoice.InvoiceStatus.PAID
                });

                List<InvoiceTimelineStep> timeline = new ArrayList<>();

                for (int i = 0; i < stages.size(); i++) {
                        String stage = stages.get(i);

                        Optional<InvoiceActionLog> logForStage = switch (stage) {
                                case "SUBMITTED" -> submittedLog;
                                case "CREATOR_REVIEW" -> creatorLog;
                                case "VERIFIER_REVIEW" -> verifierLog;
                                case "APPROVER_REVIEW" -> approverLog;
                                case "READY_FOR_PAYMENT" -> readyLog;
                                case "PAID" -> paidLog;
                                default -> Optional.empty();
                        };

                        boolean completed = false;
                        boolean current = false;

                        if (status == Invoice.InvoiceStatus.READY_FOR_PAYMENT || status == Invoice.InvoiceStatus.PAID) {
                                completed = true;
                        } else if (isRejected) {
                                int rejectedAtIndex = 1;
                                if (status == Invoice.InvoiceStatus.VERIFIER_REJECTED)
                                        rejectedAtIndex = 2;
                                else if (status == Invoice.InvoiceStatus.APPROVER_REJECTED)
                                        rejectedAtIndex = 3;
                                completed = i <= rejectedAtIndex;
                        } else {
                                completed = i < currentStageIndex;
                                current = i == currentStageIndex;
                        }

                        if (completed) {
                                timeline.add(new InvoiceTimelineStep(
                                                stage,
                                                "COMPLETED",
                                                logForStage.map(InvoiceActionLog::getActionTimestamp).orElse(
                                                                stage.equals("SUBMITTED") ? invoice.getCreatedAt()
                                                                                : null),
                                                logForStage.map(InvoiceActionLog::getRemarks).orElse(null)));
                        } else if (current) {
                                timeline.add(new InvoiceTimelineStep(stage, "CURRENT", null, null));
                        } else {
                                timeline.add(new InvoiceTimelineStep(stage, "PENDING", null, null));
                        }
                }

                if (isRejected) {
                        Optional<InvoiceActionLog> lastLog = logs.isEmpty()
                                        ? Optional.empty()
                                        : Optional.of(logs.get(logs.size() - 1));
                        timeline.add(new InvoiceTimelineStep(
                                        "REJECTED",
                                        "REJECTED",
                                        lastLog.map(InvoiceActionLog::getActionTimestamp).orElse(null),
                                        lastLog.map(InvoiceActionLog::getRemarks).orElse(null)));
                }

                return timeline;
        }

        public List<InvoiceTimelineStep> buildTimelineForReuse(
                        Invoice invoice,
                        List<InvoiceActionLog> logs) {

                
                return buildTimeline(invoice, logs);
        }

}
