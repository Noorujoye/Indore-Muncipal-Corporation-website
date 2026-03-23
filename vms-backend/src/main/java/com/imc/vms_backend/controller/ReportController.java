package com.imc.vms_backend.controller;

import com.imc.vms_backend.dto.InvoiceReportFilterRequest;
import com.imc.vms_backend.dto.InvoiceReportRow;
import com.imc.vms_backend.services.InvoiceReportService;
import com.imc.vms_backend.util.CsvExporter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final InvoiceReportService reportService;

    @PostMapping("/invoices")
    public ResponseEntity<List<InvoiceReportRow>> getInvoiceReport(
            @RequestBody InvoiceReportFilterRequest filter) {

        return ResponseEntity.ok(
                reportService.getInvoiceReport(filter)
        );
    }
    @PostMapping("/invoices/export")
    public ResponseEntity<String> exportInvoiceReport(
            @RequestBody InvoiceReportFilterRequest filter) {

        var data = reportService.getInvoiceReport(filter);
        String csv = CsvExporter.exportInvoices(data);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=invoices.csv")
                .body(csv);
    }

}
