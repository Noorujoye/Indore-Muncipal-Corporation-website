package com.imc.vms_backend.repository;

import com.imc.vms_backend.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface InvoiceReportRepository extends JpaRepository<Invoice, Long> {

    @Query("""
        SELECT i FROM Invoice i
        WHERE (:vendorName IS NULL OR i.vendor.firmName ILIKE %:vendorName%)
          AND (:tenderRef IS NULL OR i.tenderReferenceNumber ILIKE %:tenderRef%)
          AND (:status IS NULL OR i.status = :status)
          AND (:fromDate IS NULL OR i.createdAt >= :fromDate)
          AND (:toDate IS NULL OR i.createdAt <= :toDate)
    """)
    List<Invoice> findInvoicesForReport(
            @Param("vendorName") String vendorName,
            @Param("tenderRef") String tenderRef,
            @Param("status") Invoice.InvoiceStatus status,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );
}
