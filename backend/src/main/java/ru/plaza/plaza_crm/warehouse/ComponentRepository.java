package ru.plaza.plaza_crm.warehouse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface ComponentRepository extends JpaRepository<Component, Long> {

    Optional<Component> findByIdAndDeletedFalse(Long id);

    boolean existsBySkuAndDeletedFalse(String sku);

    boolean existsBySkuAndIdNotAndDeletedFalse(String sku, Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Component c WHERE c.id = :id AND c.deleted = false")
    Optional<Component> findByIdForUpdate(@Param("id") Long id);

    @Query("""
            SELECT c FROM Component c
            WHERE c.deleted = false
            AND (CAST(:name AS string) IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:name AS string), '%')))
            AND (CAST(:sku AS string) IS NULL OR LOWER(c.sku) LIKE LOWER(CONCAT('%', CAST(:sku AS string), '%')))
            """)
    Page<Component> search(@Param("name") String name,
                           @Param("sku") String sku,
                           Pageable pageable);
}