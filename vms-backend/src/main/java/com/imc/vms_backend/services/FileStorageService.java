package com.imc.vms_backend.services;

import com.imc.vms_backend.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String storeFile(MultipartFile file, String subFolder) {

        if (file.isEmpty()) {
            throw new ApiException("File is empty");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename());

        if (!isAllowedType(originalName)) {
            throw new ApiException("Only PDF, JPG, JPEG, PNG files allowed");
        }

        try {
            Path uploadPath = Paths.get(uploadDir, subFolder);
            Files.createDirectories(uploadPath);

            String storedName = UUID.randomUUID() + "_" + originalName;
            Path targetPath = uploadPath.resolve(storedName);

            Files.copy(file.getInputStream(), targetPath,
                    StandardCopyOption.REPLACE_EXISTING);

            return targetPath.toString();

        } catch (IOException e) {
            throw new ApiException("File upload failed");
        }
    }

    private boolean isAllowedType(String filename) {
        String lower = filename.toLowerCase();
        return lower.endsWith(".pdf") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png");
    }
}
