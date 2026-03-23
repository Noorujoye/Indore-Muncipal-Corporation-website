package com.imc.vms_backend.repository;

import com.imc.vms_backend.entity.InvoiceActionLog;
import com.imc.vms_backend.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface InvoiceActionLogRepository
        extends JpaRepository<InvoiceActionLog, Long> {

    List<InvoiceActionLog> findByInvoiceIdOrderByActionTimestampAsc(Long invoiceId);

    long countByActionBy_EmailAndToStatusAndActionTimestampBetween(
            String email,
            Invoice.InvoiceStatus toStatus,
            LocalDateTime start,
            LocalDateTime end);
}
