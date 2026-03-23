package com.imc.vms_backend.services;

import com.imc.vms_backend.dto.ImcInvoiceDetailResponse;
import com.imc.vms_backend.dto.InvoiceTimelineStep;
import com.imc.vms_backend.entity.Invoice;
import com.imc.vms_backend.entity.InvoiceActionLog;
import com.imc.vms_backend.exception.ApiException;
import com.imc.vms_backend.repository.InvoiceActionLogRepository;
import com.imc.vms_backend.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ImcInvoiceQueryService {

        private final InvoiceRepository invoiceRepository;
        private final InvoiceActionLogRepository logRepository;
        private final VendorInvoiceQueryService timelineHelperService;

        public ImcInvoiceDetailResponse getInvoiceDetail(Long invoiceId) {

                Invoice invoice = invoiceRepository.findById(invoiceId)
                                .orElseThrow(() -> new ApiException("Invoice not found"));

                List<InvoiceActionLog> logs = logRepository.findByInvoiceIdOrderByActionTimestampAsc(invoiceId);

                ImcInvoiceDetailResponse response = new ImcInvoiceDetailResponse();

                response.setInvoiceId(invoice.getId());
                response.setVendorName(invoice.getVendor().getFirmName());
                response.setVendorEmail(invoice.getVendor().getUser().getEmail());

                response.setVendorInvoiceNumber(invoice.getVendorInvoiceNumber());
                response.setTenderReferenceNumber(
                                invoice.getTenderReferenceNumber());
                response.setDepartmentName("Public Support Department"); 

                response.setBaseAmount(invoice.getBaseAmount());
                response.setCgst(invoice.getCgstAmount());
                response.setSgst(invoice.getSgstAmount());
                response.setTotalAmount(invoice.getTotalAmount());

                response.setCurrentStatus(invoice.getStatus().name());

                
                List<InvoiceTimelineStep> timeline = timelineHelperService.buildTimelineForReuse(invoice, logs);

                response.setTimeline(timeline);

                return response;
        }
}
