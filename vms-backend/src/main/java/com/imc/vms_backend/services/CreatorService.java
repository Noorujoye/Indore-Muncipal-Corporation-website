package com.imc.vms_backend.services;

import com.imc.vms_backend.dto.PendingVendorResponse;
import com.imc.vms_backend.dto.CreatorVendorDetailResponse;
import com.imc.vms_backend.dto.RequestDecisionRequest;
import com.imc.vms_backend.dto.VendorDirectoryRow;
import com.imc.vms_backend.email.EmailService;
import com.imc.vms_backend.email.EmailType;
import com.imc.vms_backend.entity.User;
import com.imc.vms_backend.entity.Vendor;
import com.imc.vms_backend.entity.VendorCredentialResetRequest;
import com.imc.vms_backend.entity.VendorProfileUpdateRequest;
import com.imc.vms_backend.exception.ApiException;
import com.imc.vms_backend.repository.UserRepository;
import com.imc.vms_backend.repository.VendorCredentialResetRequestRepository;
import com.imc.vms_backend.repository.VendorProfileUpdateRequestRepository;
import com.imc.vms_backend.repository.VendorRepository;
import com.imc.vms_backend.util.PasswordGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CreatorService {

    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final VendorCredentialResetRequestRepository credentialResetRequestRepository;
    private final VendorProfileUpdateRequestRepository profileUpdateRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordActionTokenService passwordActionTokenService;

    
    public List<PendingVendorResponse> getPendingVendors() {
        return vendorRepository.findByStatus(Vendor.VendorStatus.PENDING).stream()
                .map(v -> new PendingVendorResponse(
                        v.getId(),
                        v.getUser().getEmail(),
                        v.getFirmType(),
                        v.getFirmName(),
                        v.getPanNumber(),
                        v.getGstinNumber(),
                        v.getAuthorizedPersonMobile(),
                        v.getAddressLine(),
                        v.getCity(),
                        v.getDistrict(),
                        v.getState(),
                        v.getPincode(),
                        v.getBankIfsc(),
                        v.getBankAccountNumber(),
                        v.getStatus(),
                        v.getRejectionReason(),
                        v.getCreatedAt(),
                        v.getApprovedAt()))
                .collect(Collectors.toList());
    }

    public CreatorVendorDetailResponse getVendorDetails(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ApiException("Vendor not found"));

        User user = vendor.getUser();

        var pendingResetOpt = credentialResetRequestRepository
                .findFirstByVendor_IdAndStatusOrderByRequestedAtDesc(vendor.getId(),
                        VendorCredentialResetRequest.Status.PENDING);

        var pendingProfileUpdateOpt = profileUpdateRequestRepository
                .findFirstByVendor_IdAndStatusOrderByRequestedAtDesc(vendor.getId(),
                        VendorProfileUpdateRequest.Status.PENDING);

        return CreatorVendorDetailResponse.builder()
                .id(vendor.getId())
                .firmType(vendor.getFirmType())
                .firmName(vendor.getFirmName())
                .registrationNumber(vendor.getRegistrationNumber())
                .registrationDate(vendor.getRegistrationDate())
                .msmeNumber(vendor.getMsmeNumber())
                .panNumber(vendor.getPanNumber())
                .gstinNumber(vendor.getGstinNumber())
                .addressLine(vendor.getAddressLine())
                .city(vendor.getCity())
                .district(vendor.getDistrict())
                .state(vendor.getState())
                .pincode(vendor.getPincode())
                .authorizedPersonName(vendor.getAuthorizedPersonName())
                .authorizedPersonDob(vendor.getAuthorizedPersonDob())
                .authorizedPersonDesignation(vendor.getAuthorizedPersonDesignation())
                .authorizedPersonMobile(vendor.getAuthorizedPersonMobile())
                .authorizedPersonAadhaar(vendor.getAuthorizedPersonAadhaar())
                .bankIfsc(vendor.getBankIfsc())
                .bankAccountNumber(vendor.getBankAccountNumber())
                .status(vendor.getStatus())
                .rejectionReason(vendor.getRejectionReason())
                .createdAt(vendor.getCreatedAt())
                .approvedAt(vendor.getApprovedAt())
                .updatedAt(vendor.getUpdatedAt())
                .email(user == null ? null : user.getEmail())
                .hasLogo(vendor.getLogoPath() != null && !vendor.getLogoPath().isBlank())

                .hasPendingCredentialResetRequest(pendingResetOpt.isPresent())
                .pendingCredentialResetRequestedAt(
                        pendingResetOpt.map(VendorCredentialResetRequest::getRequestedAt).orElse(null))

                .pendingProfileUpdateRequestId(
                        pendingProfileUpdateOpt.map(VendorProfileUpdateRequest::getId).orElse(null))
                .pendingProfileUpdateReason(
                        pendingProfileUpdateOpt.map(VendorProfileUpdateRequest::getReason).orElse(null))
                .pendingProfileUpdateDetails(
                        pendingProfileUpdateOpt.map(VendorProfileUpdateRequest::getDetails).orElse(null))
                .pendingProfileUpdateRequestedAt(
                        pendingProfileUpdateOpt.map(VendorProfileUpdateRequest::getRequestedAt).orElse(null))
                .build();
    }

    
    public List<VendorDirectoryRow> getVendorDirectory() {
        return vendorRepository.findAll().stream()
                .map(v -> new VendorDirectoryRow(
                        v.getId(),
                        v.getFirmName(),
                        v.getFirmType(),
                        v.getUser() != null ? v.getUser().getEmail() : null,
                        v.getStatus(),
                        v.getCreatedAt(),
                        v.getLogoPath() != null && !v.getLogoPath().trim().isEmpty()))
                .collect(Collectors.toList());
    }

    public Resource getVendorLogo(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ApiException("Vendor not found"));

        String logoPath = vendor.getLogoPath();
        if (logoPath == null || logoPath.trim().isEmpty()) {
            throw new ApiException("Vendor logo not found");
        }

        java.io.File file = new java.io.File(logoPath);
        if (!file.exists() || !file.isFile()) {
            throw new ApiException("Vendor logo not found");
        }

        return new FileSystemResource(file);
    }

    public String getVendorLogoContentType(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ApiException("Vendor not found"));

        String contentType = vendor.getLogoContentType();
        if (contentType != null && !contentType.trim().isEmpty()) {
            return contentType;
        }

        String logoPath = vendor.getLogoPath();
        if (logoPath == null || logoPath.trim().isEmpty()) {
            return null;
        }

        try {
            return java.nio.file.Files.probeContentType(java.nio.file.Paths.get(logoPath));
        } catch (Exception e) {
            return null;
        }
    }

    
    public void updateVendorStatus(Long vendorId, Vendor.VendorStatus newStatus) {
        if (newStatus == null) {
            throw new ApiException("Status is required");
        }
        if (newStatus != Vendor.VendorStatus.ACTIVE && newStatus != Vendor.VendorStatus.BLOCKED) {
            throw new ApiException("Only ACTIVE or BLOCKED are allowed");
        }

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ApiException("Vendor not found"));

        if (vendor.getStatus() == Vendor.VendorStatus.PENDING) {
            throw new ApiException("Cannot change status while vendor is pending approval");
        }

        User user = vendor.getUser();
        if (user == null) {
            throw new ApiException("Vendor user not found");
        }

        vendor.setStatus(newStatus);
        if (newStatus == Vendor.VendorStatus.BLOCKED) {
            user.setStatus(User.UserStatus.DISABLED);
        } else {
            user.setStatus(User.UserStatus.ACTIVE);
        }

        userRepository.save(user);
        vendorRepository.save(vendor);
    }

    
    public void approveVendor(Long vendorId) {

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ApiException("Vendor not found"));

        if (vendor.getStatus() != Vendor.VendorStatus.PENDING) {
            throw new ApiException("Vendor is not in pending state");
        }

        User user = vendor.getUser();

        
        
        user.setPasswordHash(passwordEncoder.encode(PasswordGenerator.generatePassword(24)));
        user.setStatus(User.UserStatus.ACTIVE);

        vendor.setStatus(Vendor.VendorStatus.ACTIVE);
        vendor.setApprovedAt(LocalDateTime.now());
        vendor.setRejectionReason(null);

        userRepository.save(user);
        vendorRepository.save(vendor);

        String setPasswordLink = passwordActionTokenService.createSetPasswordLink(user);

        
        emailService.sendEmail(
                user.getEmail(),
                EmailType.VENDOR_APPROVED,
                vendor.getFirmName(),
                setPasswordLink);
    }

    
    
    @Transactional
    public void resetVendorCredentials(Long vendorId, String creatorEmail) {

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ApiException("Vendor not found"));

        if (vendor.getStatus() == Vendor.VendorStatus.PENDING) {
            throw new ApiException("Vendor is pending approval; approve vendor to send credentials");
        }
        if (vendor.getStatus() == Vendor.VendorStatus.REJECTED) {
            throw new ApiException("Vendor is rejected; cannot send login credentials");
        }

        User user = vendor.getUser();
        if (user == null) {
            throw new ApiException("Vendor user not found");
        }
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new ApiException("Vendor email not found");
        }

        
        
        user.setPasswordHash(passwordEncoder.encode(PasswordGenerator.generatePassword(24)));
        userRepository.save(user);

        
        List<VendorCredentialResetRequest> pendingRequests = credentialResetRequestRepository
                .findByVendor_IdAndStatus(vendor.getId(), VendorCredentialResetRequest.Status.PENDING);

        User processedBy = null;
        if (creatorEmail != null && !creatorEmail.isBlank()) {
            processedBy = userRepository.findByEmail(creatorEmail).orElse(null);
        }

        if (!pendingRequests.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            for (VendorCredentialResetRequest req : pendingRequests) {
                req.setStatus(VendorCredentialResetRequest.Status.COMPLETED);
                req.setProcessedAt(now);
                req.setProcessedBy(processedBy);
                req.setProcessedComment("Credentials reset and email sent");
            }
            credentialResetRequestRepository.saveAll(pendingRequests);
        }

        String resetLink = passwordActionTokenService.createResetPasswordLink(user);

        emailService.sendEmail(
                user.getEmail(),
                EmailType.VENDOR_CREDENTIALS_RESET,
                vendor.getFirmName(),
                resetLink);
    }

    @Transactional
    public void resolveProfileUpdateRequest(Long requestId, String creatorEmail, RequestDecisionRequest request) {
        VendorProfileUpdateRequest req = profileUpdateRequestRepository.findById(requestId)
                .orElseThrow(() -> new ApiException("Profile update request not found"));

        if (req.getStatus() != VendorProfileUpdateRequest.Status.PENDING) {
            throw new ApiException("Request already processed");
        }

        User processedBy = null;
        if (creatorEmail != null && !creatorEmail.isBlank()) {
            processedBy = userRepository.findByEmail(creatorEmail).orElse(null);
        }

        req.setStatus(VendorProfileUpdateRequest.Status.RESOLVED);
        req.setProcessedAt(LocalDateTime.now());
        req.setProcessedBy(processedBy);
        String comment = request == null ? null : request.getComment();
        req.setProcessedComment(comment == null || comment.isBlank() ? "Resolved" : comment.trim());
        profileUpdateRequestRepository.save(req);
    }

    @Transactional
    public void rejectProfileUpdateRequest(Long requestId, String creatorEmail, RequestDecisionRequest request) {
        VendorProfileUpdateRequest req = profileUpdateRequestRepository.findById(requestId)
                .orElseThrow(() -> new ApiException("Profile update request not found"));

        if (req.getStatus() != VendorProfileUpdateRequest.Status.PENDING) {
            throw new ApiException("Request already processed");
        }

        User processedBy = null;
        if (creatorEmail != null && !creatorEmail.isBlank()) {
            processedBy = userRepository.findByEmail(creatorEmail).orElse(null);
        }

        req.setStatus(VendorProfileUpdateRequest.Status.REJECTED);
        req.setProcessedAt(LocalDateTime.now());
        req.setProcessedBy(processedBy);
        String comment = request == null ? null : request.getComment();
        req.setProcessedComment(comment == null || comment.isBlank() ? "Rejected" : comment.trim());
        profileUpdateRequestRepository.save(req);
    }

    
    public void rejectVendor(Long vendorId, String reason) {

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ApiException("Vendor not found"));

        if (vendor.getStatus() != Vendor.VendorStatus.PENDING) {
            throw new ApiException("Vendor is not in pending state");
        }

        vendor.setStatus(Vendor.VendorStatus.REJECTED);
        vendor.setRejectionReason((reason == null || reason.trim().isEmpty()) ? null : reason.trim());
        User user = vendor.getUser();
        user.setStatus(User.UserStatus.DISABLED);
        userRepository.save(user);
        vendorRepository.save(vendor);

        emailService.sendEmail(
                vendor.getUser().getEmail(),
                EmailType.VENDOR_REJECTED,
                vendor.getFirmName(),
                null);
    }
}
