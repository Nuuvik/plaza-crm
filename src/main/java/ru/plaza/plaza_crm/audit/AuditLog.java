package ru.plaza.plaza_crm.audit;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String entityType;

    private Long entityId;

    private String action;

    private String username;

    private LocalDateTime createdAt = LocalDateTime.now();
}