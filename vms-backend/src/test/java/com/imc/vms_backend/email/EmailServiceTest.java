package com.imc.vms_backend.email;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private HttpClient httpClient;

    @Mock
    private HttpResponse<String> httpResponse;

    private EmailService emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailService(httpClient);
        emailService.setApiKey("test-brevo-api-key-12345");
        emailService.setFromAddress("noreply@imc.org");
        emailService.setFromName("IMC Vendor Management System");
        emailService.setApiUrl("https://api.brevo.com/v3/smtp/email");
        emailService.setTimeoutMs(5000);
    }

    @Test
    @DisplayName("Should skip sending if recipient email is empty or null")
    void shouldSkipSendingIfRecipientIsEmpty() {
        emailService.sendEmail("", EmailType.VENDOR_APPROVED, "Test Vendor", "token123");
        emailService.sendEmail(null, EmailType.VENDOR_APPROVED, "Test Vendor", "token123");

        verifyNoInteractions(httpClient);
    }

    @Test
    @DisplayName("Should skip sending gracefully if BREVO_API_KEY is not configured")
    void shouldSkipSendingIfApiKeyMissing() {
        emailService.setApiKey("");

        assertThatCode(() -> emailService.sendEmail("vendor@example.com", EmailType.VENDOR_APPROVED, "Vendor Firm", "https://link"))
                .doesNotThrowAnyException();

        verifyNoInteractions(httpClient);
    }

    @Test
    @DisplayName("Should skip sending gracefully if MAIL_FROM sender address is not configured")
    void shouldSkipSendingIfFromAddressMissing() {
        emailService.setFromAddress("");

        assertThatCode(() -> emailService.sendEmail("vendor@example.com", EmailType.VENDOR_APPROVED, "Vendor Firm", "https://link"))
                .doesNotThrowAnyException();

        verifyNoInteractions(httpClient);
    }

    @Test
    @DisplayName("Should construct proper JSON payload and send via Brevo HTTPS API on 201 Created")
    void shouldSendEmailSuccessfullyOn201Created() throws Exception {
        when(httpResponse.statusCode()).thenReturn(201);
        when(httpResponse.body()).thenReturn("{\"messageId\":\"<202403201530.123456@smtp-relay.mailin.fr>\"}");
        doReturn(httpResponse).when(httpClient).send(any(HttpRequest.class), any());

        emailService.sendEmail("vendor@example.com", EmailType.VENDOR_APPROVED, "Acme Infrastructure", "https://imc.gov.in/set-password?token=abc");

        ArgumentCaptor<HttpRequest> requestCaptor = ArgumentCaptor.forClass(HttpRequest.class);
        verify(httpClient, times(1)).send(requestCaptor.capture(), any());

        HttpRequest capturedRequest = requestCaptor.getValue();
        assertThat(capturedRequest.uri().toString()).isEqualTo("https://api.brevo.com/v3/smtp/email");
        assertThat(capturedRequest.method()).isEqualTo("POST");
        assertThat(capturedRequest.headers().firstValue("api-key")).contains("test-brevo-api-key-12345");
        assertThat(capturedRequest.headers().firstValue("content-type")).contains("application/json");
        assertThat(capturedRequest.headers().firstValue("accept")).contains("application/json");
    }

    @Test
    @DisplayName("Should handle 401 Unauthorized from Brevo safely without throwing exceptions")
    void shouldHandleApiErrorsWithoutThrowing() throws Exception {
        when(httpResponse.statusCode()).thenReturn(401);
        when(httpResponse.body()).thenReturn("{\"code\":\"unauthorized\",\"message\":\"Key not found\"}");
        doReturn(httpResponse).when(httpClient).send(any(HttpRequest.class), any());

        assertThatCode(() -> emailService.sendEmail("vendor@example.com", EmailType.INVOICE_APPROVED, "Acme Infrastructure", "Invoice No: 1234"))
                .doesNotThrowAnyException();

        verify(httpClient, times(1)).send(any(HttpRequest.class), any());
    }

    @Test
    @DisplayName("Should catch network/socket timeouts gracefully without breaking calling workflows")
    void shouldHandleNetworkTimeoutGracefully() throws Exception {
        doThrow(new IOException("Connection timed out")).when(httpClient).send(any(HttpRequest.class), any());

        assertThatCode(() -> emailService.sendEmail("vendor@example.com", EmailType.INVOICE_PAID, "Acme Infrastructure", "Invoice No: 1234"))
                .doesNotThrowAnyException();
    }
}
