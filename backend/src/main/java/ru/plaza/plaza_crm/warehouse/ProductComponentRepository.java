package ru.plaza.plaza_crm.warehouse;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductComponentRepository extends JpaRepository<ProductComponent, Long> {

    @Query("""
            SELECT pc FROM ProductComponent pc
            JOIN FETCH pc.component
            WHERE pc.product.id = :productId
            """)
    List<ProductComponent> findByProductId(@Param("productId") Long productId);

    Optional<ProductComponent> findByProductIdAndComponentId(Long productId, Long componentId);

    boolean existsByComponentId(Long componentId);
}