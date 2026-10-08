package com.imc.vms_backend;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@Slf4j
public class VmsBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(VmsBackendApplication.class, args);
		log.info("Indore Municipal Corporation - Vendor Management System backend initialized successfully.");
	}
}
