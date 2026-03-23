package com.imc.vms_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "firm_type", nullable = false)
    private String firmType;

    @Column(name = "firm_name", nullable = false)
    private String firmName;

    @Column(name = "registration_number")
    private String registrationNumber;

    @Column(name = "registration_date")
    private LocalDate registrationDate;

    @Column(name = "msme_number")
    private String msmeNumber;

    @Column(name = "pan_number", nullable = false, unique = true, length = 10)
    private String panNumber;

    @Column(name = "gstin_number", nullable = false, unique = true, length = 15)
    private String gstinNumber;

    @Column(name = "address_line", nullable = false)
    private String addressLine;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "district", nullable = false)
    private String district;

    @Column(name = "state", nullable = false)
    private String state;

    @Column(name = "pincode", nullable = false, length = 6)
    private String pincode;

    @Column(name = "authorized_person_name", nullable = false)
    private String authorizedPersonName;

    @Column(name = "authorized_person_dob")
    private LocalDate authorizedPersonDob;

    @Column(name = "authorized_person_designation")
    private String authorizedPersonDesignation;

    @Column(name = "authorized_person_mobile", nullable = false, length = 15)
    private String authorizedPersonMobile;

    @Column(name = "authorized_person_aadhaar", nullable = false, length = 12)
    private String authorizedPersonAadhaar;

    @Column(name = "bank_ifsc")
    private String bankIfsc;

    @Column(name = "bank_account_number")
    private String bankAccountNumber;

    @Column(name = "logo_path")
    private String logoPath;

    @Column(name = "logo_content_type")
    private String logoContentType;

    @Column(name = "logo_original_name")
    private String logoOriginalName;

    @Enumerated(EnumType.STRING)
    private VendorStatus status = VendorStatus.PENDING;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum VendorStatus {
        PENDING,
        APPROVED,
        REJECTED,
        ACTIVE,
        BLOCKED
    }
}
