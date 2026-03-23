package com.imc.vms_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "invoice_action_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceActionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @ManyToOne
    @JoinColumn(name = "action_by_user_id", nullable = false)
    private User actionBy;

    @Enumerated(EnumType.STRING)
    private User.Role role;

    @Enumerated(EnumType.STRING)
    private Invoice.InvoiceStatus fromStatus;

    @Enumerated(EnumType.STRING)
    private Invoice.InvoiceStatus toStatus;

    private String remarks;

    @PrePersist
    public void onAction() {
        this.actionTimestamp = LocalDateTime.now();
    }

    private LocalDateTime actionTimestamp;
}
