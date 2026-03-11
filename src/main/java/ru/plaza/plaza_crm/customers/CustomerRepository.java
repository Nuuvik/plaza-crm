package ru.plaza.plaza_crm.customers;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    @Query("""
            SELECT c FROM Customer c
            WHERE c.deleted = false
            AND (CAST(:name AS string) IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:name AS string), '%')))
            AND (CAST(:phone AS string) IS NULL OR c.phone LIKE CONCAT('%', CAST(:phone AS string), '%'))
            AND (CAST(:email AS string) IS NULL OR LOWER(c.email) LIKE LOWER(CONCAT('%', CAST(:email AS string), '%')))
            """)
    Page<Customer> search(@Param("name") String name, @Param("phone") String phone, @Param("email") String email, Pageable pageable);

    Optional<Customer> findByIdAndDeletedFalse(Long id);

    boolean existsByPhoneAndDeletedFalse(String phone);

    boolean existsByEmailAndDeletedFalse(String email);

    boolean existsByIdAndDeletedFalse(Long id);

    boolean existsByPhoneAndIdNotAndDeletedFalse(String phone, Long id);

    boolean existsByEmailAndIdNotAndDeletedFalse(String email, Long id);
}