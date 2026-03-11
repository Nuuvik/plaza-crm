package ru.plaza.plaza_crm.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("""
            SELECT a FROM AuditLog a
            WHERE (CAST(:entityType AS string) IS NULL OR a.entityType = CAST(:entityType AS string))
            AND (CAST(:username AS string) IS NULL OR a.username = CAST(:username AS string))
            ORDER BY a.createdAt DESC
            """)
    Page<AuditLog> search(@Param("entityType") String entityType,
                          @Param("username") String username,
                          Pageable pageable);
}