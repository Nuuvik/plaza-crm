package ru.plaza.plaza_crm.stats;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.plaza.plaza_crm.customers.CustomerRepository;
import ru.plaza.plaza_crm.orders.OrderRepository;
import ru.plaza.plaza_crm.orders.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StatsService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;

    public StatsService(OrderRepository orderRepository, CustomerRepository customerRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
    }

    @Transactional(readOnly = true)
    public StatsResponse getStats() {
        LocalDateTime startOfMonth = LocalDateTime.now()
                .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);

        long totalOrders = orderRepository.countActive();

        BigDecimal totalRevenue = Optional.ofNullable(orderRepository.sumRevenue())
                .orElse(BigDecimal.ZERO);

        Map<OrderStatus, Long> ordersByStatus = orderRepository.countByStatus()
                .stream()
                .collect(Collectors.toMap(
                        row -> (OrderStatus) row[0],
                        row -> (Long) row[1]
                ));

        long newOrdersThisMonth = orderRepository.countCreatedAfter(startOfMonth);
        long totalCustomers = customerRepository.countByDeletedFalse();
        long newCustomersThisMonth = customerRepository.countByCreatedAtAfterAndDeletedFalse(startOfMonth);

        return new StatsResponse(totalOrders, totalCustomers, totalRevenue,
                ordersByStatus, newCustomersThisMonth, newOrdersThisMonth);
    }
}