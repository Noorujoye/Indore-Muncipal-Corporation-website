package com.imc.vms_backend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.security.Key;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;
import java.util.List;

@Component
@Slf4j
public class JwtUtil {

    private final Environment environment;

    public JwtUtil(Environment environment) {
        this.environment = environment;
    }

    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.accessTokenExpirationMs:900000}")
    private long accessTokenExpirationMs;

    @Value("${app.jwt.refreshTokenExpirationMs:604800000}")
    private long refreshTokenExpirationMs;

    private Key key;

    @PostConstruct
    void init() {
        if (secretKey == null || secretKey.trim().length() < 32) {
            List<String> activeProfiles = List.of(environment.getActiveProfiles());
            boolean isDev = activeProfiles.contains("dev");

            if (isDev) {
                
                
                
                byte[] randomBytes = new byte[48];
                new SecureRandom().nextBytes(randomBytes);
                secretKey = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
                log.warn(
                        "app.jwt.secret was missing/too short; generated a temporary dev secret (set JWT_SECRET for a stable one)");
            } else {
                throw new IllegalStateException("app.jwt.secret must be set and at least 32 characters long");
            }
        }
        key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String generateAccessToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("type", "ACCESS")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .claim("type", "REFRESH")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    
    
    public String generateToken(String email, String role) {
        return generateAccessToken(email, role);
    }

    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
