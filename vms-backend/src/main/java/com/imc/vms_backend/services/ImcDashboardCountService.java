package com.imc.vms_backend.services;

import com.imc.vms_backend.dto.ImcDashboardCountResponse;
import com.imc.vms_backend.entity.Invoice;
import com.imc.vms_backend.entity.Vendor;
import com.imc.vms_backend.repository.InvoiceActionLogRepository;
import com.imc.vms_backend.repository.InvoiceRepository;
import com.imc.vms_backend.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class ImcDashboardCountService {

        private final VendorRepository vendorRepository;
        private final InvoiceRepository invoiceRepository;
        private final InvoiceActionLogRepository actionLogRepository;

        private LocalDateTime startOfToday() {
                return LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        }

        private LocalDateTime startOfTomorrow() {
                return startOfToday().plusDays(1);
        }

        public ImcDashboardCountResponse getCreatorCounts(String email) {
                LocalDateTime start = startOfToday();
                LocalDateTime end = startOfTomorrow();

                long forwardedToday = actionLogRepository
                                .countByActionBy_EmailAndToStatusAndActionTimestampBetween(
                                                email,
                                                Invoice.InvoiceStatus.CREATOR_APPROVED,
                                                start,
                                                end);

                long rejectedToday = actionLogRepository
                                .countByActionBy_EmailAndToStatusAndActionTimestampBetween(
                                                email,
                                                Invoice.InvoiceStatus.CREATOR_REJECTED,
                                                start,
                                                end);

                return ImcDashboardCountResponse.builder()
                                .pendingVendors(vendorRepository.countByStatus(Vendor.VendorStatus.PENDING))
                                .pendingInvoices(invoiceRepository.countByStatus(Invoice.InvoiceStatus.SUBMITTED))
                                .readyForPayment(0)
                                .forwardedToday(forwardedToday)
                                .rejectedToday(rejectedToday)
                                .build();
        }

        public ImcDashboardCountResponse getVerifierCounts(String email) {
                LocalDateTime start = startOfToday();
                LocalDateTime end = startOfTomorrow();

                long verifiedToday = actionLogRepository
                                .countByActionBy_EmailAndToStatusAndActionTimestampBetween(
                                                email,
                                                Invoice.InvoiceStatus.VERIFIER_APPROVED,
                                                start,
                                                end);

                long returnedForCorrection = actionLogRepository
                                .countByActionBy_EmailAndToStatusAndActionTimestampBetween(
                                                email,
                                                Invoice.InvoiceStatus.VERIFIER_REJECTED,
                                                start,
                                                end);

                return ImcDashboardCountResponse.builder()
                                .pendingVendors(0)
                                .pendingInvoices(
                                                invoiceRepository.countByStatus(Invoice.InvoiceStatus.CREATOR_APPROVED))
                                .readyForPayment(0)
                                .verifiedToday(verifiedToday)
                                .returnedForCorrection(returnedForCorrection)
                                .forwardedToApprover(verifiedToday)
                                .build();
        }

        public ImcDashboardCountResponse getApproverCounts(String email) {
                LocalDateTime start = startOfToday();
                LocalDateTime end = startOfTomorrow();

                long approvedToday = actionLogRepository
                                .countByActionBy_EmailAndToStatusAndActionTimestampBetween(
                                                email,
                                                Invoice.InvoiceStatus.READY_FOR_PAYMENT,
                                                start,
                                                end);

                long rejectedToday = actionLogRepository
                                .countByActionBy_EmailAndToStatusAndActionTimestampBetween(
                                                email,
                                                Invoice.InvoiceStatus.APPROVER_REJECTED,
                                                start,
                                                end);

                return ImcDashboardCountResponse.builder()
                                .pendingVendors(0)
                                .pendingInvoices(invoiceRepository
                                                .countByStatus(Invoice.InvoiceStatus.VERIFIER_APPROVED))
                                .readyForPayment(invoiceRepository
                                                .countByStatus(Invoice.InvoiceStatus.READY_FOR_PAYMENT))
                                .approvedToday(approvedToday)
                                .rejectedToday(rejectedToday)
                                .build();
        }
}
