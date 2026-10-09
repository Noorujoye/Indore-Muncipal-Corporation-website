package com.imc.vms_backend.email;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Transactional email service using Brevo's official HTTPS API.
 * Replaces outbound SMTP (blocked by Render Free and firewalled environments).
 * Endpoint: POST https://api.brevo.com/v3/smtp/email
 */
@Service
@Slf4j
public class EmailService {

    private final HttpClient httpClient;

    @Value("${app.mail.from:${MAIL_FROM:}}")
    private String fromAddress;

    @Value("${app.mail.from-name:${MAIL_FROM_NAME:IMC Vendor Management System}}")
    private String fromName;

    @Value("${app.mail.brevo.api-key:${BREVO_API_KEY:}}")
    private String apiKey;

    @Value("${app.mail.brevo.api-url:${BREVO_API_URL:https://api.brevo.com/v3/smtp/email}}")
    private String apiUrl;

    @Value("${app.mail.brevo.timeout-ms:${BREVO_TIMEOUT_MS:10000}}")
    private int timeoutMs;

    public EmailService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Package-private constructor for unit testing with custom HttpClient.
     */
    EmailService(HttpClient httpClient) {
        this.httpClient = httpClient;
    }

    @PostConstruct
    void logMailConfig() {
        boolean hasApiKey = apiKey != null && !apiKey.isBlank();
        boolean hasFrom = fromAddress != null && !fromAddress.isBlank();
        log.info(
                "Brevo HTTPS email client initialized: apiUrl={}, fromPresent={}, apiKeyPresent={}, timeoutMs={}",
                (apiUrl == null || apiUrl.isBlank()) ? "<empty>" : apiUrl,
                hasFrom,
                hasApiKey,
                timeoutMs);
    }

    public void sendEmail(
            String to,
            EmailType type,
            String vendorName,
            String extraInfo) {

        if (to == null || to.isBlank()) {
            log.warn("Email skipped: empty recipient (type={})", type);
            return;
        }

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Email skipped: BREVO_API_KEY is not configured (type={}, to={})", type, to);
            return;
        }

        if (fromAddress == null || fromAddress.isBlank()) {
            log.warn("Email skipped: MAIL_FROM is not configured (type={}, to={})", type, to);
            return;
        }

        try {
            String subject = EmailContentBuilder.buildSubject(type);
            String body = EmailContentBuilder.buildBody(type, vendorName, extraInfo);
            String htmlContent = buildHtmlContent(body);

            String recipientName = (vendorName != null && !vendorName.isBlank()) ? vendorName : to;
            String senderName = (fromName != null && !fromName.isBlank()) ? fromName : "IMC Vendor Management System";

            String requestJson = buildJsonPayload(senderName, fromAddress.trim(), recipientName, to.trim(), subject, body, htmlContent);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("accept", "application/json")
                    .header("api-key", apiKey.trim())
                    .header("content-type", "application/json")
                    .timeout(Duration.ofMillis(timeoutMs > 0 ? timeoutMs : 10000))
                    .POST(HttpRequest.BodyPublishers.ofString(requestJson, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            int statusCode = response.statusCode();

            if (statusCode >= 200 && statusCode < 300) {
                String messageId = extractMessageId(response.body());
                log.info("Brevo API accepted email (to={}, type={}, statusCode={}, messageId={}) - Note: API acceptance confirms dispatch queueing, not final mailbox delivery",
                        to, type, statusCode, messageId);
            } else {
                String sanitizedError = sanitizeErrorBody(response.body());
                log.warn("Brevo API rejected email (to={}, type={}, statusCode={}): {}",
                        to, type, statusCode, sanitizedError);
            }

        } catch (Exception e) {
            StringBuilder details = new StringBuilder();
            details.append(e.getClass().getSimpleName());
            if (e.getMessage() != null && !e.getMessage().isBlank()) {
                details.append(": ").append(e.getMessage());
            }
            Throwable cause = e.getCause();
            if (cause != null && cause.getMessage() != null) {
                details.append(" | cause=").append(cause.getClass().getSimpleName()).append(": ").append(cause.getMessage());
            }
            log.warn("Email dispatch failed (to={}, type={}): {}", to, type, details);
        }
    }

    private String buildJsonPayload(String senderName, String senderEmail, String recipientName, String recipientEmail,
                                     String subject, String textContent, String htmlContent) {
        return "{"
                + "\"sender\":{\"name\":\"" + escapeJson(senderName) + "\",\"email\":\"" + escapeJson(senderEmail) + "\"},"
                + "\"to\":[{\"name\":\"" + escapeJson(recipientName) + "\",\"email\":\"" + escapeJson(recipientEmail) + "\"}],"
                + "\"subject\":\"" + escapeJson(subject) + "\","
                + "\"textContent\":\"" + escapeJson(textContent) + "\","
                + "\"htmlContent\":\"" + escapeJson(htmlContent) + "\""
                + "}";
    }

    private String buildHtmlContent(String textBody) {
        if (textBody == null) return "";
        String escaped = textBody
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\n", "<br/>");

        return "<div style=\"font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;\">"
                + "<div style=\"border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px;\">"
                + "<strong style=\"font-size: 16px; color: #0369a1;\">Indore Municipal Corporation (IMC)</strong><br/>"
                + "<span style=\"font-size: 12px; color: #64748b;\">Vendor Management System</span>"
                + "</div>"
                + "<div>" + escaped + "</div>"
                + "</div>";
    }

    private String extractMessageId(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return "n/a";
        }
        int idx = responseBody.indexOf("\"messageId\"");
        if (idx != -1) {
            int colon = responseBody.indexOf(':', idx);
            if (colon != -1) {
                int firstQuote = responseBody.indexOf('"', colon);
                if (firstQuote != -1) {
                    int secondQuote = responseBody.indexOf('"', firstQuote + 1);
                    if (secondQuote != -1) {
                        return responseBody.substring(firstQuote + 1, secondQuote);
                    }
                }
            }
        }
        return "accepted";
    }

    private String sanitizeErrorBody(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return "<empty>";
        }
        String trimmed = responseBody.trim();
        if (trimmed.length() > 300) {
            trimmed = trimmed.substring(0, 300) + "...";
        }
        return trimmed;
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\b' -> sb.append("\\b");
                case '\f' -> sb.append("\\f");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                default -> {
                    if (c < ' ') {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
                }
            }
        }
        return sb.toString();
    }

    // Setters for unit testing
    void setFromAddress(String fromAddress) {
        this.fromAddress = fromAddress;
    }

    void setFromName(String fromName) {
        this.fromName = fromName;
    }

    void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    void setApiUrl(String apiUrl) {
        this.apiUrl = apiUrl;
    }

    void setTimeoutMs(int timeoutMs) {
        this.timeoutMs = timeoutMs;
    }
}
