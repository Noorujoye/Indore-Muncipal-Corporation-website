package com.imc.vms_backend.repository;

import com.imc.vms_backend.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByEntityTypeAndEntityId(String entityType, Long entityId);
}
