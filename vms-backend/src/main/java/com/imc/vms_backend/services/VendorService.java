package com.imc.vms_backend.services;

import com.imc.vms_backend.dto.VendorProfileUpdateRequestCreateRequest;
import com.imc.vms_backend.dto.VendorRegistrationRequest;
import com.imc.vms_backend.dto.VendorProfileResponse;
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
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.imc.vms_backend.util.PasswordGenerator;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorService {
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final VendorCredentialResetRequestRepository credentialResetRequestRepository;
    private final VendorProfileUpdateRequestRepository profileUpdateRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;
    private final EmailService emailService;
    private final PasswordActionTokenService passwordActionTokenService;

    @Transactional
    public void createForgotPasswordRequest(String emailRaw) {
        String email = emailRaw == null ? "" : emailRaw.trim();
        if (email.isEmpty()) {
            throw new ApiException("Email is required");
        }

        Vendor vendor = vendorRepository.findByUserEmail(email).orElse(null);
        if (vendor == null) {
            return;
        }

        Vendor.VendorStatus status = vendor.getStatus();
        if (status == Vendor.VendorStatus.PENDING) {
            throw new ApiException("Your registration is awaiting approval. Please wait for the approval email.");
        }
        if (status == Vendor.VendorStatus.REJECTED) {
            throw new ApiException("Your registration was rejected. Please re-apply with correct information.");
        }
        if (status == Vendor.VendorStatus.BLOCKED) {
            throw new ApiException("Your account is blocked. Please contact support.");
        }

        User user = vendor.getUser();
        if (user == null) {
            return;
        }
        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new ApiException("User account is not active");
        }

        
        List<VendorCredentialResetRequest> pending = credentialResetRequestRepository
                .findByVendor_IdAndStatus(vendor.getId(), VendorCredentialResetRequest.Status.PENDING);
        if (!pending.isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            for (VendorCredentialResetRequest req : pending) {
                req.setStatus(VendorCredentialResetRequest.Status.COMPLETED);
                req.setProcessedAt(now);
                req.setProcessedBy(null);
                req.setProcessedComment("Self-service reset link sent");
            }
            credentialResetRequestRepository.saveAll(pending);
        }

        String resetLink = passwordActionTokenService.createResetPasswordLink(user);
        emailService.sendEmail(
                user.getEmail(),
                EmailType.VENDOR_CREDENTIALS_RESET,
                vendor.getFirmName(),
                resetLink);
    }

    @Transactional
    public void createProfileUpdateRequest(String vendorEmail, VendorProfileUpdateRequestCreateRequest request) {
        Vendor vendor = vendorRepository.findByUserEmail(vendorEmail)
                .orElseThrow(() -> new ApiException("Vendor profile not found"));

        if (vendor.getStatus() == Vendor.VendorStatus.PENDING) {
            throw new ApiException("Your account is pending approval. Profile updates are not available yet.");
        }
        if (vendor.getStatus() == Vendor.VendorStatus.REJECTED) {
            throw new ApiException("Your registration was rejected. Please re-apply.");
        }
        if (vendor.getStatus() == Vendor.VendorStatus.BLOCKED) {
            throw new ApiException("Your account is blocked. Please contact support.");
        }

        if (profileUpdateRequestRepository.existsByVendor_IdAndStatus(vendor.getId(),
                VendorProfileUpdateRequest.Status.PENDING)) {
            throw new ApiException("A profile update request is already pending.");
        }

        profileUpdateRequestRepository.save(VendorProfileUpdateRequest.builder()
                .vendor(vendor)
                .reason(request.getReason() == null ? "" : request.getReason().trim())
                .details(request.getDetails() == null ? "" : request.getDetails().trim())
                .status(VendorProfileUpdateRequest.Status.PENDING)
                .requestedAt(java.time.LocalDateTime.now())
                .build());
    }

    private void storeVendorLogoIfPresent(Vendor vendor, MultipartFile profilePhoto) {
        if (profilePhoto == null || profilePhoto.isEmpty()) {
            return;
        }

        String storedPath = fileStorageService.storeFile(profilePhoto, "vendors/" + vendor.getId());
        vendor.setLogoPath(storedPath);
        vendor.setLogoContentType(profilePhoto.getContentType());
        vendor.setLogoOriginalName(profilePhoto.getOriginalFilename());
    }

    private void ensureUniqueGstin(String gstinNumber, Long currentVendorIdOrNull) {
        final String gstin = gstinNumber == null ? "" : gstinNumber.trim();
        if (gstin.isEmpty()) {
            throw new ApiException("GSTIN is required");
        }

        vendorRepository.findByGstinNumber(gstin).ifPresent(existing -> {
            if (currentVendorIdOrNull == null || !existing.getId().equals(currentVendorIdOrNull)) {
                throw new ApiException("GSTIN number is already registered. Please use a different GSTIN.");
            }
        });
    }

    @Transactional
    public void registerVendor(VendorRegistrationRequest request, MultipartFile profilePhoto) {

        final String email = request.getEmail() == null ? "" : request.getEmail().trim();
        if (email.isEmpty()) {
            throw new ApiException("Email is required");
        }

        var existingUserOpt = userRepository.findByEmail(email);

        
        if (existingUserOpt.isEmpty()) {
            
            ensureUniqueGstin(request.getGstinNumber(), null);

            User user = User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode(PasswordGenerator.generatePassword(24)))
                    .role(User.Role.VENDOR)
                    .status(User.UserStatus.DISABLED)
                    .build();
            userRepository.save(user);

            Vendor vendor = Vendor.builder()
                    .user(user)
                    .firmType(request.getFirmType())
                    .firmName(request.getFirmName())
                    .panNumber(request.getPanNumber())
                    .gstinNumber(request.getGstinNumber())
                    .addressLine(request.getAddressLine())
                    .city(request.getCity())
                    .district(request.getDistrict())
                    .state(request.getState())
                    .pincode(request.getPincode())
                    .authorizedPersonName(request.getAuthorizedPersonName())
                    .authorizedPersonDob(request.getAuthorizedPersonDob())
                    .authorizedPersonDesignation(request.getAuthorizedPersonDesignation())
                    .authorizedPersonMobile(request.getMobile())
                    .authorizedPersonAadhaar(request.getAuthorizedPersonAadhaar())
                    .bankIfsc(request.getBankIfsc())
                    .bankAccountNumber(request.getBankAccountNumber())
                    .status(Vendor.VendorStatus.PENDING)
                    .rejectionReason(null)
                    .build();
            vendorRepository.save(vendor);

            storeVendorLogoIfPresent(vendor, profilePhoto);
            vendorRepository.save(vendor);
            return;
        }

        User existingUser = existingUserOpt.get();
        Vendor vendor = vendorRepository.findByUserEmail(email)
                .orElseThrow(() -> new ApiException("This email is already registered. Please contact support."));

        
        Vendor.VendorStatus status = vendor.getStatus();
        if (status == Vendor.VendorStatus.PENDING) {
            
            throw new ApiException("Your registration request is already under review.");
        }
        if (status == Vendor.VendorStatus.REJECTED) {
            
            ensureUniqueGstin(request.getGstinNumber(), vendor.getId());
            vendor.setFirmType(request.getFirmType());
            vendor.setFirmName(request.getFirmName());
            vendor.setPanNumber(request.getPanNumber());
            vendor.setGstinNumber(request.getGstinNumber());
            vendor.setAddressLine(request.getAddressLine());
            vendor.setCity(request.getCity());
            vendor.setDistrict(request.getDistrict());
            vendor.setState(request.getState());
            vendor.setPincode(request.getPincode());
            vendor.setAuthorizedPersonName(request.getAuthorizedPersonName());
            vendor.setAuthorizedPersonDob(request.getAuthorizedPersonDob());
            vendor.setAuthorizedPersonDesignation(request.getAuthorizedPersonDesignation());
            vendor.setAuthorizedPersonMobile(request.getMobile());
            vendor.setAuthorizedPersonAadhaar(request.getAuthorizedPersonAadhaar());
            vendor.setBankIfsc(request.getBankIfsc());
            vendor.setBankAccountNumber(request.getBankAccountNumber());
            vendor.setStatus(Vendor.VendorStatus.PENDING);
            vendor.setRejectionReason(null);

            storeVendorLogoIfPresent(vendor, profilePhoto);
            vendorRepository.save(vendor);

            
            if (existingUser.getRole() != User.Role.VENDOR) {
                throw new ApiException("This email is not a vendor account. Please contact support.");
            }
            existingUser.setStatus(User.UserStatus.DISABLED);
            userRepository.save(existingUser);
            return;
        }
        if (status == Vendor.VendorStatus.BLOCKED) {
            
            throw new ApiException("Your account has been blocked. Please contact support.");
        }
        if (status == Vendor.VendorStatus.ACTIVE || status == Vendor.VendorStatus.APPROVED) {
            
            throw new ApiException("This email is already registered. Please log in.");
        }

        throw new ApiException("Registration is not allowed for the current account state.");
    }

    @Transactional(readOnly = true)
    public VendorProfileResponse getMyProfile(String email) {
        Vendor vendor = vendorRepository.findByUserEmail(email)
                .orElseThrow(() -> new ApiException("Vendor profile not found"));

        return VendorProfileResponse.builder()
                .id(vendor.getId())
                .firmName(vendor.getFirmName())
                .firmType(vendor.getFirmType())
                .email(vendor.getUser() == null ? null : vendor.getUser().getEmail())
                .mobile(vendor.getAuthorizedPersonMobile())
                .panNumber(vendor.getPanNumber())
                .gstinNumber(vendor.getGstinNumber())
                .authorizedPersonName(vendor.getAuthorizedPersonName())
                .authorizedPersonDesignation(vendor.getAuthorizedPersonDesignation())
                .authorizedPersonAadhaar(vendor.getAuthorizedPersonAadhaar())
                .addressLine(vendor.getAddressLine())
                .city(vendor.getCity())
                .district(vendor.getDistrict())
                .state(vendor.getState())
                .pincode(vendor.getPincode())
                .bankIfsc(vendor.getBankIfsc())
                .bankAccountNumber(vendor.getBankAccountNumber())
                .status(vendor.getStatus())
                .hasLogo(vendor.getLogoPath() != null && !vendor.getLogoPath().trim().isEmpty())
                .build();
    }

    @Transactional(readOnly = true)
    public Resource getMyLogo(String email) {
        Vendor vendor = vendorRepository.findByUserEmail(email)
                .orElseThrow(() -> new ApiException("Vendor profile not found"));

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

    @Transactional(readOnly = true)
    public String getMyLogoContentType(String email) {
        Vendor vendor = vendorRepository.findByUserEmail(email)
                .orElseThrow(() -> new ApiException("Vendor profile not found"));

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

    public java.util.List<Vendor> getPendingVendors() {
        return vendorRepository.findByStatus(Vendor.VendorStatus.PENDING);
    }

    
}
