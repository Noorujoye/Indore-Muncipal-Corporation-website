package com.imc.vms_backend.util;

import com.imc.vms_backend.dto.InvoiceReportRow;

import java.util.List;

public class CsvExporter {

    public static String exportInvoices(List<InvoiceReportRow> rows) {

        StringBuilder sb = new StringBuilder();
        sb.append("InvoiceId,Vendor,InvoiceNo,Tender,Amount,Status,Date\n");

        for (InvoiceReportRow r : rows) {
            sb.append(r.getInvoiceId()).append(",")
                    .append(r.getVendorName()).append(",")
                    .append(r.getVendorInvoiceNumber()).append(",")
                    .append(r.getTenderReference()).append(",")
                    .append(r.getTotalAmount()).append(",")
                    .append(r.getStatus()).append(",")
                    .append(r.getSubmittedAt()).append("\n");
        }
        return sb.toString();
    }
}
