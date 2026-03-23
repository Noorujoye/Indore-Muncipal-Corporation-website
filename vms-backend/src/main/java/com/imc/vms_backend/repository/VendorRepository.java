package com.imc.vms_backend.repository;

import java.util.List;
import com.imc.vms_backend.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
    List<Vendor> findByStatus(Vendor.VendorStatus status);

    long countByStatus(Vendor.VendorStatus status);

    Optional<Vendor> findByUserEmail(String email);

    Optional<Vendor> findByGstinNumber(String gstinNumber);
}
