package ru.plaza.plaza_crm.products;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Для обычных операций (включая архивированные — для редактирования/просмотра)
    Optional<Product> findByIdAndDeletedFalse(Long id);

    // Только активные — для добавления в заказы
    Optional<Product> findByIdAndDeletedFalseAndArchivedFalse(Long id);

    Optional<Product> findBySkuAndDeletedFalse(String sku);

    boolean existsBySkuAndDeletedFalse(String sku);

    boolean existsBySkuAndIdNotAndDeletedFalse(String sku, Long id);

    @Query("""
        SELECT p FROM Product p
        LEFT JOIN FETCH p.car
        WHERE p.deleted = false
        AND p.archived = false
        AND (:carId IS NULL OR p.car.id = :carId)
        AND (CAST(:name AS string) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:name AS string), '%')))
        AND (CAST(:sku AS string) IS NULL OR LOWER(p.sku) LIKE LOWER(CONCAT('%', CAST(:sku AS string), '%')))
        """)
    Page<Product> search(@Param("carId") Long carId,
                         @Param("name") String name,
                         @Param("sku") String sku,
                         Pageable pageable);

    @Query("""
        SELECT p FROM Product p
        LEFT JOIN FETCH p.car
        WHERE p.deleted = false
        AND p.archived = true
        AND (:carId IS NULL OR p.car.id = :carId)
        AND (CAST(:name AS string) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:name AS string), '%')))
        AND (CAST(:sku AS string) IS NULL OR LOWER(p.sku) LIKE LOWER(CONCAT('%', CAST(:sku AS string), '%')))
        """)
    Page<Product> searchArchived(@Param("carId") Long carId,
                                 @Param("name") String name,
                                 @Param("sku") String sku,
                                 Pageable pageable);
}