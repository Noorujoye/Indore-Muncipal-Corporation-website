package com.imc.vms_backend.repository;

import com.imc.vms_backend.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    
    List<Invoice> findByStatus(Invoice.InvoiceStatus status);

    
    List<Invoice> findByVendorId(Long vendorId);

    
    List<Invoice> findByTenderReferenceNumber(String tenderReferenceNumber);

    
    boolean existsByVendorIdAndVendorInvoiceNumber(Long vendorId, String vendorInvoiceNumber);

    long countByVendorIdAndStatusIn(Long vendorId,
                                    java.util.List<Invoice.InvoiceStatus> statuses);

    long countByVendorIdAndStatus(Long vendorId, Invoice.InvoiceStatus status);

    long countByStatus(Invoice.InvoiceStatus status);

}
