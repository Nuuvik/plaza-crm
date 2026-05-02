package ru.plaza.plaza_crm.warehouse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AssemblyLogRepository extends JpaRepository<AssemblyLog, Long> {

    @Query("""
            SELECT a FROM AssemblyLog a
            JOIN FETCH a.product
            WHERE a.deleted = false
            AND (:productId IS NULL OR a.product.id = :productId)
            ORDER BY a.createdAt DESC
            """)
    Page<AssemblyLog> search(@Param("productId") Long productId, Pageable pageable);
}