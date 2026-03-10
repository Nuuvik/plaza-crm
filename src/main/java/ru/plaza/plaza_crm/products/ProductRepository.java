package ru.plaza.plaza_crm.products;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByDeletedFalse(Pageable pageable);

    Page<Product> findByCarAndDeletedFalse(String car, Pageable pageable);

    Optional<Product> findByIdAndDeletedFalse(Long id);

    Optional<Product> findBySkuAndDeletedFalse(String sku);

    boolean existsBySkuAndDeletedFalse(String sku);

    boolean existsBySkuAndIdNotAndDeletedFalse(String sku, Long id);
}
