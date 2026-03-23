package com.imc.vms_backend.services;

import com.imc.vms_backend.entity.PasswordActionToken;
import com.imc.vms_backend.entity.User;
import com.imc.vms_backend.exception.ApiException;
import com.imc.vms_backend.repository.PasswordActionTokenRepository;
import com.imc.vms_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PasswordActionTokenService {

    private final PasswordActionTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Value("${app.auth.password-token.set-password-ttl-minutes:10080}")
    private long setPasswordTtlMinutes;

    @Value("${app.auth.password-token.reset-password-ttl-minutes:60}")
    private long resetPasswordTtlMinutes;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public String createSetPasswordLink(User user) {
        String rawToken = createToken(user, PasswordActionToken.Purpose.SET_PASSWORD, setPasswordTtlMinutes);
        return buildLink(rawToken);
    }

    public String createResetPasswordLink(User user) {
        String rawToken = createToken(user, PasswordActionToken.Purpose.RESET_PASSWORD, resetPasswordTtlMinutes);
        return buildLink(rawToken);
    }

    private String buildLink(String rawToken) {
        String base = frontendBaseUrl == null ? "" : frontendBaseUrl.trim();
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base + "/set-password?token=" + rawToken;
    }

    @Transactional
    protected String createToken(User user, PasswordActionToken.Purpose purpose, long ttlMinutes) {
        if (user == null || user.getId() == null) {
            throw new ApiException("User is required");
        }

        
        List<PasswordActionToken> active = tokenRepository
                .findByUser_IdAndPurposeAndUsedAtIsNullAndRevokedAtIsNull(user.getId(), purpose);
        if (!active.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            for (PasswordActionToken t : active) {
                t.setRevokedAt(now);
            }
            tokenRepository.saveAll(active);
        }

        String rawToken = generateRawToken();
        String tokenHash = sha256Hex(rawToken);

        LocalDateTime now = LocalDateTime.now();
        PasswordActionToken token = PasswordActionToken.builder()
                .user(user)
                .purpose(purpose)
                .tokenHash(tokenHash)
                .createdAt(now)
                .expiresAt(now.plusMinutes(Math.max(1, ttlMinutes)))
                .build();

        tokenRepository.save(token);
        return rawToken;
    }

    @Transactional
    public void setPasswordWithToken(String rawToken, String newPassword) {
        String token = rawToken == null ? "" : rawToken.trim();
        if (token.isEmpty()) {
            throw new ApiException("Invalid or expired token");
        }
        String password = newPassword == null ? "" : newPassword;
        if (password.trim().length() < 8) {
            throw new ApiException("Password must be at least 8 characters");
        }

        String tokenHash = sha256Hex(token);
        PasswordActionToken actionToken = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ApiException("Invalid or expired token"));

        if (actionToken.getUsedAt() != null || actionToken.getRevokedAt() != null) {
            throw new ApiException("Invalid or expired token");
        }
        if (actionToken.getExpiresAt() != null && actionToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException("Invalid or expired token");
        }

        User user = userRepository.findById(actionToken.getUser().getId())
                .orElseThrow(() -> new ApiException("User not found"));

        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new ApiException("User account is not active");
        }

        user.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(user);

        actionToken.setUsedAt(LocalDateTime.now());
        tokenRepository.save(actionToken);
    }

    private static String generateRawToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Unable to hash token", e);
        }
    }
}
