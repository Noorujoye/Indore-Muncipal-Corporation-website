package com.imc.vms_backend.repository;

import com.imc.vms_backend.entity.VendorProfileUpdateRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VendorProfileUpdateRequestRepository extends JpaRepository<VendorProfileUpdateRequest, Long> {

    boolean existsByVendor_IdAndStatus(Long vendorId, VendorProfileUpdateRequest.Status status);

    Optional<VendorProfileUpdateRequest> findFirstByVendor_IdAndStatusOrderByRequestedAtDesc(
            Long vendorId,
            VendorProfileUpdateRequest.Status status);

    List<VendorProfileUpdateRequest> findByVendor_IdAndStatus(Long vendorId, VendorProfileUpdateRequest.Status status);
}
