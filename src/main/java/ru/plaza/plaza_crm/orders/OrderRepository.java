package ru.plaza.plaza_crm.orders;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByDeletedFalse(Pageable pageable);

    Page<Order> findByStatusAndDeletedFalse(OrderStatus status, Pageable pageable);

    Optional<Order> findByIdAndDeletedFalse(Long id);

    Page<Order> findByCustomerIdAndDeletedFalse(Long customerId, Pageable pageable);

    Page<Order> findByCustomerIdAndStatusAndDeletedFalse(Long customerId, OrderStatus status, Pageable pageable);

    @Query("""
        SELECT o FROM Order o
        WHERE o.deleted = false
        AND (CAST(:status AS string) IS NULL OR o.status = :status)
        AND (:customerId IS NULL OR o.customer.id = :customerId)
        AND (:from IS NULL OR o.createdAt >= :from)
        AND (:to IS NULL OR o.createdAt <= :to)
        """)
    Page<Order> search(@Param("status") OrderStatus status,
                       @Param("customerId") Long customerId,
                       @Param("from") LocalDateTime from,
                       @Param("to") LocalDateTime to,
                       Pageable pageable);

    List<Order> findAllByDeletedFalse();

}
