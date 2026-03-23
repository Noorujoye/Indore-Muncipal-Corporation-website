package com.imc.vms_backend.controller;

import com.imc.vms_backend.dto.LoginRequest;
import com.imc.vms_backend.dto.SetPasswordRequest;
import com.imc.vms_backend.dto.RefreshTokenRequest;
import com.imc.vms_backend.dto.TokenResponse;
import com.imc.vms_backend.dto.ApiResponse;
import com.imc.vms_backend.entity.User;
import com.imc.vms_backend.repository.UserRepository;
import com.imc.vms_backend.services.AuthService;
import com.imc.vms_backend.services.PasswordActionTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

        private final AuthService authService;
        private final UserRepository userRepository;
        private final PasswordActionTokenService passwordActionTokenService;

        @Value("${app.auth.cookie.secure:false}")
        private boolean cookieSecure;

        @Value("${app.auth.cookie.sameSite:Lax}")
        private String cookieSameSite;

        @Value("${app.jwt.accessTokenExpirationMs:900000}")
        private long accessTokenExpirationMs;

        @Value("${app.jwt.refreshTokenExpirationMs:604800000}")
        private long refreshTokenExpirationMs;

        @PostMapping("/login")
        public ResponseEntity<TokenResponse>

                        login(
                                        @Valid @RequestBody LoginRequest request) {
                TokenResponse tokenResponse = authService.login(request);

                ResponseCookie accessCookie = ResponseCookie.from("accessToken", tokenResponse.getAccessToken())
                                .httpOnly(true)
                                .secure(cookieSecure)
                                .path("/")
                                .sameSite(cookieSameSite)
                                .maxAge(Duration.ofMillis(accessTokenExpirationMs))
                                .build();

                ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", tokenResponse.getRefreshToken())
                                .httpOnly(true)
                                .secure(cookieSecure)
                                .path("/api/auth")
                                .sameSite(cookieSameSite)
                                .maxAge(Duration.ofMillis(refreshTokenExpirationMs))
                                .build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                                .body(tokenResponse);
        }

        @PostMapping("/refresh-token")
        public ResponseEntity<TokenResponse> refreshToken(
                        @RequestBody(required = false) RefreshTokenRequest request,
                        @CookieValue(value = "refreshToken", required = false) String refreshTokenCookie) {
                String refreshToken = request != null ? request.getRefreshToken() : null;
                if ((refreshToken == null || refreshToken.isBlank()) && refreshTokenCookie != null
                                && !refreshTokenCookie.isBlank()) {
                        refreshToken = refreshTokenCookie;
                }

                TokenResponse tokenResponse = authService.refreshToken(new RefreshTokenRequest(refreshToken));

                ResponseCookie accessCookie = ResponseCookie.from("accessToken", tokenResponse.getAccessToken())
                                .httpOnly(true)
                                .secure(cookieSecure)
                                .path("/")
                                .sameSite(cookieSameSite)
                                .maxAge(Duration.ofMillis(accessTokenExpirationMs))
                                .build();

                ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", tokenResponse.getRefreshToken())
                                .httpOnly(true)
                                .secure(cookieSecure)
                                .path("/api/auth")
                                .sameSite(cookieSameSite)
                                .maxAge(Duration.ofMillis(refreshTokenExpirationMs))
                                .build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                                .body(tokenResponse);
        }

        @GetMapping("/me")
        public ResponseEntity<TokenResponse> me(Authentication authentication) {
                if (authentication == null || authentication.getName() == null) {
                        return ResponseEntity.status(401).build();
                }
                String email = authentication.getName();
                User user = userRepository.findByEmail(email).orElse(null);
                if (user == null) {
                        return ResponseEntity.status(401).build();
                }
                return ResponseEntity.ok(new TokenResponse(null, null, user.getRole().name(), user.getEmail()));
        }

        @PostMapping("/logout")
        public ResponseEntity<Void> logout() {
                ResponseCookie clearAccess = ResponseCookie.from("accessToken", "")
                                .httpOnly(true)
                                .secure(cookieSecure)
                                .path("/")
                                .sameSite(cookieSameSite)
                                .maxAge(Duration.ZERO)
                                .build();

                ResponseCookie clearRefresh = ResponseCookie.from("refreshToken", "")
                                .httpOnly(true)
                                .secure(cookieSecure)
                                .path("/api/auth")
                                .sameSite(cookieSameSite)
                                .maxAge(Duration.ZERO)
                                .build();

                return ResponseEntity.noContent()
                                .header(HttpHeaders.SET_COOKIE, clearAccess.toString())
                                .header(HttpHeaders.SET_COOKIE, clearRefresh.toString())
                                .build();
        }

        @PostMapping("/set-password")
        public ResponseEntity<ApiResponse> setPassword(@Valid @RequestBody SetPasswordRequest request) {
                passwordActionTokenService.setPasswordWithToken(request.getToken(), request.getPassword());
                return ResponseEntity.ok(new ApiResponse(true, "Password updated. You can now log in."));
        }
}
