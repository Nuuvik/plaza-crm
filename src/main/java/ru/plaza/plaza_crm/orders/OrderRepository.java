package ru.plaza.plaza_crm.orders;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByDeletedFalse(Pageable pageable);

    Page<Order> findByStatusAndDeletedFalse(OrderStatus status, Pageable pageable);

    Optional<Order> findByIdAndDeletedFalse(Long id);

    Page<Order> findByCustomerIdAndDeletedFalse(Long customerId, Pageable pageable);

    Page<Order> findByCustomerIdAndStatusAndDeletedFalse(Long customerId, OrderStatus status, Pageable pageable);

}
