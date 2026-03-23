package com.imc.vms_backend.config;

import com.imc.vms_backend.entity.*;
import com.imc.vms_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            if (userRepository.count() == 0) {
                log.info("Initializing database with default IMC users...");

                
                User creator = User.builder()
                        .email("creator@imc.com")
                        .passwordHash(passwordEncoder.encode("password123"))
                        .role(User.Role.CREATOR)
                        .status(User.UserStatus.ACTIVE)
                        .build();
                userRepository.save(creator);
                log.info("Created CREATOR user: {}", creator.getEmail());

                
                User verifier = User.builder()
                        .email("verifier@imc.com")
                        .passwordHash(passwordEncoder.encode("password123"))
                        .role(User.Role.VERIFIER)
                        .status(User.UserStatus.ACTIVE)
                        .build();
                userRepository.save(verifier);
                log.info("Created VERIFIER user: {}", verifier.getEmail());

                
                User approver = User.builder()
                        .email("approver@imc.com")
                        .passwordHash(passwordEncoder.encode("password123"))
                        .role(User.Role.APPROVER)
                        .status(User.UserStatus.ACTIVE)
                        .build();
                userRepository.save(approver);
                log.info("Created APPROVER user: {}", approver.getEmail());
                log.info("Database initialization complete!");
            } else {
                log.info("Database already contains {} users. Skipping initialization.", userRepository.count());
            }
        };
    }
}
