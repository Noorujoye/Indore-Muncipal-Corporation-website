package com.imc.vms_backend.repository;

import com.imc.vms_backend.entity.PasswordActionToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PasswordActionTokenRepository extends JpaRepository<PasswordActionToken, Long> {

    Optional<PasswordActionToken> findByTokenHash(String tokenHash);

    List<PasswordActionToken> findByUser_IdAndPurposeAndUsedAtIsNullAndRevokedAtIsNull(Long userId,
            PasswordActionToken.Purpose purpose);
}
