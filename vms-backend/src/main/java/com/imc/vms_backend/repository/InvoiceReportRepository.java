package com.imc.vms_backend.repository;

import com.imc.vms_backend.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface InvoiceReportRepository extends JpaRepository<Invoice, Long>, JpaSpecificationExecutor<Invoice> {

}
