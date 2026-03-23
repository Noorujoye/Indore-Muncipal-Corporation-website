package com.imc.vms_backend.services;

import com.imc.vms_backend.util.JwtUtil;
import com.imc.vms_backend.dto.LoginRequest;
import com.imc.vms_backend.dto.LoginResponse;
import com.imc.vms_backend.dto.TokenResponse;
import com.imc.vms_backend.dto.RefreshTokenRequest;
import com.imc.vms_backend.entity.User;
import com.imc.vms_backend.exception.ApiException;
import com.imc.vms_backend.repository.UserRepository;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public TokenResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Invalid email or password"));

        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new ApiException("User account is not active");
        }

        boolean passwordMatch = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());

        if (!passwordMatch) {
            throw new ApiException("Invalid email or password");
        }

        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return new TokenResponse(accessToken, refreshToken, user.getRole().name(), user.getEmail());
    }

    public TokenResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtUtil.validateToken(refreshToken)) {
            throw new ApiException("Invalid refresh token");
        }

        Claims claims = jwtUtil.extractClaims(refreshToken);
        String email = claims.getSubject();
        String type = claims.get("type", String.class);

        if (!"REFRESH".equals(type)) {
            throw new ApiException("Invalid token type");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new ApiException("User account is not active");
        }

        String newAccessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        return new TokenResponse(newAccessToken, newRefreshToken, user.getRole().name(), user.getEmail());
    }
}
