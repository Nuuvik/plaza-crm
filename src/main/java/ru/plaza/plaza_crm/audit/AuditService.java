package ru.plaza.plaza_crm.audit;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository repository;

    public AuditService(AuditLogRepository repository) {
        this.repository = repository;
    }

    public void log(String entityType, Long entityId, String action) {

        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        AuditLog log = new AuditLog();
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setAction(action);
        log.setUsername(username);

        repository.save(log);
    }
}