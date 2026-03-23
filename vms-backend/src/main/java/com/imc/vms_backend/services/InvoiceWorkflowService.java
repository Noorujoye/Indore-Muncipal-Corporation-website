package com.imc.vms_backend.services;

import com.imc.vms_backend.dto.InvoiceActionRequest;
import com.imc.vms_backend.email.EmailService;
import com.imc.vms_backend.email.EmailType;
import com.imc.vms_backend.entity.*;
import com.imc.vms_backend.exception.ApiException;
import com.imc.vms_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class InvoiceWorkflowService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceActionLogRepository actionLogRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public void creatorApprove(Long invoiceId, String email) {

        Invoice invoice = getInvoice(invoiceId);

        if (invoice.getStatus() != Invoice.InvoiceStatus.SUBMITTED) {
            throw new ApiException("Invoice is not in submitted state");
        }

        User user = getUser(email);

        updateInvoiceStatus(invoice, user,
                Invoice.InvoiceStatus.CREATOR_APPROVED,
                null);
    }

    @Transactional
    public void creatorReject(Long invoiceId, String email, InvoiceActionRequest request) {

        validateRemarks(request);

        Invoice invoice = getInvoice(invoiceId);

        if (invoice.getStatus() != Invoice.InvoiceStatus.SUBMITTED) {
            throw new ApiException("Invoice is not in submitted state");
        }

        User user = getUser(email);

        updateInvoiceStatus(invoice, user,
                Invoice.InvoiceStatus.CREATOR_REJECTED,
                request.getRemarks());
    }

    @Transactional
    public void verifierApprove(Long invoiceId, String email) {

        Invoice invoice = getInvoice(invoiceId);

        if (invoice.getStatus() != Invoice.InvoiceStatus.CREATOR_APPROVED) {
            throw new ApiException("Invoice not approved by creator");
        }

        User user = getUser(email);

        updateInvoiceStatus(invoice, user,
                Invoice.InvoiceStatus.VERIFIER_APPROVED,
                null);
    }

    @Transactional
    public void markPaid(Long invoiceId, String email) {

        Invoice invoice = getInvoice(invoiceId);

        if (invoice.getStatus() != Invoice.InvoiceStatus.READY_FOR_PAYMENT) {
            throw new ApiException("Invoice is not ready for payment");
        }

        User user = getUser(email);

        updateInvoiceStatus(invoice, user,
                Invoice.InvoiceStatus.PAID,
                null);
    }

    @Transactional
    public void verifierReject(Long invoiceId, String email, InvoiceActionRequest request) {

        validateRemarks(request);

        Invoice invoice = getInvoice(invoiceId);

        if (invoice.getStatus() != Invoice.InvoiceStatus.CREATOR_APPROVED) {
            throw new ApiException("Invoice not approved by creator");
        }

        User user = getUser(email);

        updateInvoiceStatus(invoice, user,
                Invoice.InvoiceStatus.VERIFIER_REJECTED,
                request.getRemarks());
    }

    @Transactional
    public void approverApprove(Long invoiceId, String email) {

        Invoice invoice = getInvoice(invoiceId);

        if (invoice.getStatus() != Invoice.InvoiceStatus.VERIFIER_APPROVED) {
            throw new ApiException("Invoice not verified");
        }

        User user = getUser(email);

        updateInvoiceStatus(invoice, user,
                Invoice.InvoiceStatus.READY_FOR_PAYMENT,
                null);
    }

    @Transactional
    public void approverReject(Long invoiceId, String email, InvoiceActionRequest request) {

        validateRemarks(request);

        Invoice invoice = getInvoice(invoiceId);

        if (invoice.getStatus() != Invoice.InvoiceStatus.VERIFIER_APPROVED) {
            throw new ApiException("Invoice not verified");
        }

        User user = getUser(email);

        updateInvoiceStatus(invoice, user,
                Invoice.InvoiceStatus.APPROVER_REJECTED,
                request.getRemarks());
    }

    

    private Invoice getInvoice(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ApiException("Invoice not found"));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));
    }

    private void validateRemarks(InvoiceActionRequest request) {
        if (request == null || request.getRemarks() == null || request.getRemarks().isBlank()) {
            throw new ApiException("Remarks are required for rejection");
        }
    }

    private void updateInvoiceStatus(
            Invoice invoice,
            User user,
            Invoice.InvoiceStatus newStatus,
            String remarks) {
        Invoice.InvoiceStatus oldStatus = invoice.getStatus();

        invoice.setStatus(newStatus);
        invoiceRepository.save(invoice);

        InvoiceActionLog log = InvoiceActionLog.builder()
                .invoice(invoice)
                .actionBy(user)
                .role(user.getRole())
                .fromStatus(oldStatus)
                .toStatus(newStatus)
                .remarks(remarks)
                .actionTimestamp(LocalDateTime.now())
                .build();

        actionLogRepository.save(log);

        
        String invoiceRef = invoice.getVendorInvoiceNumber() == null
                ? ""
                : ("Invoice No: " + invoice.getVendorInvoiceNumber());

        if (newStatus == Invoice.InvoiceStatus.CREATOR_APPROVED) {
            emailService.sendEmail(
                    invoice.getVendor().getUser().getEmail(),
                    EmailType.INVOICE_CREATOR_APPROVED,
                    invoice.getVendor().getFirmName(),
                    invoiceRef);
        } else if (newStatus == Invoice.InvoiceStatus.VERIFIER_APPROVED) {
            emailService.sendEmail(
                    invoice.getVendor().getUser().getEmail(),
                    EmailType.INVOICE_VERIFIER_APPROVED,
                    invoice.getVendor().getFirmName(),
                    invoiceRef);
        } else if (newStatus == Invoice.InvoiceStatus.READY_FOR_PAYMENT) {
            emailService.sendEmail(
                    invoice.getVendor().getUser().getEmail(),
                    EmailType.INVOICE_APPROVED,
                    invoice.getVendor().getFirmName(),
                    invoiceRef);
        } else if (newStatus == Invoice.InvoiceStatus.PAID) {
            emailService.sendEmail(
                    invoice.getVendor().getUser().getEmail(),
                    EmailType.INVOICE_PAID,
                    invoice.getVendor().getFirmName(),
                    invoiceRef);
        } else if (newStatus.name().contains("REJECTED")) {
            emailService.sendEmail(
                    invoice.getVendor().getUser().getEmail(),
                    EmailType.INVOICE_REJECTED,
                    invoice.getVendor().getFirmName(),
                    remarks);
        }
    }
}
