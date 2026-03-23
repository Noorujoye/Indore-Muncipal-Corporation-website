package com.imc.vms_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices", uniqueConstraints = @UniqueConstraint(columnNames = { "vendor_id", "vendor_invoice_number" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @Column(name = "tender_reference_number", nullable = false, length = 50)
    private String tenderReferenceNumber;

    @Column(name = "vendor_invoice_number", nullable = false)
    private String vendorInvoiceNumber;

    @Column(length = 300)
    private String workDescription;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal baseAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cgstAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal sgstAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum InvoiceStatus {
        DRAFT,
        SUBMITTED,
        CREATOR_REJECTED,
        CREATOR_APPROVED,
        VERIFIER_REJECTED,
        VERIFIER_APPROVED,
        APPROVER_REJECTED,
        READY_FOR_PAYMENT,
        PAID
    }
}
