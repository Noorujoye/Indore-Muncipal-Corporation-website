package com.imc.vms_backend.repository;

import com.imc.vms_backend.entity.VendorCredentialResetRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VendorCredentialResetRequestRepository extends JpaRepository<VendorCredentialResetRequest, Long> {

    boolean existsByVendor_IdAndStatus(Long vendorId, VendorCredentialResetRequest.Status status);

    Optional<VendorCredentialResetRequest> findFirstByVendor_IdAndStatusOrderByRequestedAtDesc(
            Long vendorId,
            VendorCredentialResetRequest.Status status);

    List<VendorCredentialResetRequest> findByVendor_IdAndStatus(Long vendorId,
            VendorCredentialResetRequest.Status status);
}
