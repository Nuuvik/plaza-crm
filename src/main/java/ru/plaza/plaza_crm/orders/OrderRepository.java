package ru.plaza.plaza_crm.orders;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByIdAndDeletedFalse(Long id);

    Page<Order> findByCustomerIdAndDeletedFalse(Long customerId, Pageable pageable);

    @Query("""
            SELECT o FROM Order o
            WHERE o.deleted = false
            AND (:status IS NULL OR o.status = :status)
            AND (:customerId IS NULL OR o.customer.id = :customerId)
            AND (:from IS NULL OR o.createdAt >= :from)
            AND (:to IS NULL OR o.createdAt <= :to)
            """)
    Page<Order> search(@Param("status") OrderStatus status,
                       @Param("customerId") Long customerId,
                       @Param("from") LocalDateTime from,
                       @Param("to") LocalDateTime to,
                       Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.deleted = false")
    long countActive();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.deleted = false AND o.createdAt >= :from")
    long countCreatedAfter(@Param("from") LocalDateTime from);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.deleted = false AND o.status != 'CANCELLED'")
    BigDecimal sumRevenue();

    @Query("SELECT o.status, COUNT(o) FROM Order o WHERE o.deleted = false GROUP BY o.status")
    List<Object[]> countByStatus();
}
