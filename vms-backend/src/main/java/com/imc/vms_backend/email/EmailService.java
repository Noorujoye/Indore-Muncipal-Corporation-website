package com.imc.vms_backend.email;

import jakarta.mail.internet.MimeMessage;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:${MAIL_FROM:}}")
    private String fromAddress;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${MAIL_USERNAME:}")
    private String mailUsernameRaw;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${spring.mail.port:0}")
    private int mailPort;

    @Value("${spring.mail.properties.mail.smtp.auth:false}")
    private boolean smtpAuth;

    @Value("${spring.mail.properties.mail.smtp.starttls.enable:false}")
    private boolean startTls;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @PostConstruct
    void logMailConfig() {
        boolean hasUsername = fromAddress != null && !fromAddress.isBlank();
        boolean hasMailUsernameRaw = mailUsernameRaw != null && !mailUsernameRaw.isBlank();
        boolean hasSmtpUsername = smtpUsername != null && !smtpUsername.isBlank();
        boolean hasPassword = mailPassword != null && !mailPassword.isBlank();
        log.info(
                "Mail config loaded: host={}, port={}, fromPresent={}, smtpUsernamePresent={}, mailUsernamePresent={}, passwordPresent={}, smtpAuth={}, startTls={}",
                (mailHost == null || mailHost.isBlank()) ? "<empty>" : mailHost,
                mailPort,
                hasUsername,
                hasSmtpUsername,
                hasMailUsernameRaw,
                hasPassword,
                smtpAuth,
                startTls);
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

        boolean hasFrom = fromAddress != null && !fromAddress.isBlank();
        boolean hasSmtpUsername = smtpUsername != null && !smtpUsername.isBlank();
        boolean hasAnyUsername = hasSmtpUsername || (mailUsernameRaw != null && !mailUsernameRaw.isBlank());
        boolean hasPassword = mailPassword != null && !mailPassword.isBlank();
        boolean hasHost = mailHost != null && !mailHost.isBlank();
        boolean hasPort = mailPort > 0;

        if (!hasHost || !hasPort || !hasAnyUsername || !hasPassword) {
            log.warn(
                    "Email skipped: SMTP config missing (hostPresent={}, portPresent={}, usernamePresent={}, passwordPresent={})",
                    hasHost,
                    hasPort,
                    hasAnyUsername,
                    hasPassword);
            return;
        }

        try {
            String subject = EmailContentBuilder.buildSubject(type);
            String body = EmailContentBuilder.buildBody(type, vendorName, extraInfo);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(to);
            
            
            if (hasFrom) {
                helper.setFrom(fromAddress);
            } else if (hasSmtpUsername) {
                helper.setFrom(smtpUsername);
            } else {
                helper.setFrom(mailUsernameRaw);
            }
            helper.setSubject(subject);
            helper.setText(body, false);

            mailSender.send(message);

            log.info("Email sent (to={}, type={})", to, type);

        } catch (Exception e) {
            
            
            StringBuilder details = new StringBuilder();
            details.append(e.getClass().getSimpleName());
            if (e.getMessage() != null && !e.getMessage().isBlank()) {
                details.append(": ").append(e.getMessage());
            }

            Throwable cause = e.getCause();
            int depth = 0;
            while (cause != null && depth < 5) {
                details.append(" | cause=").append(cause.getClass().getSimpleName());
                if (cause.getMessage() != null && !cause.getMessage().isBlank()) {
                    details.append(": ").append(cause.getMessage());
                }
                cause = cause.getCause();
                depth++;
            }

            log.warn("Email sending failed (to={}, type={}): {}", to, type, details);
        }
    }
}
