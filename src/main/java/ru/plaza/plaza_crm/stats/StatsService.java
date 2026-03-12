package ru.plaza.plaza_crm.stats;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.plaza.plaza_crm.customers.CustomerRepository;
import ru.plaza.plaza_crm.orders.Order;
import ru.plaza.plaza_crm.orders.OrderRepository;
import ru.plaza.plaza_crm.orders.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);

        List<Order> allOrders = orderRepository.findAllByDeletedFalse();

        long totalOrders = allOrders.size();

        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<OrderStatus, Long> ordersByStatus = allOrders.stream()
                .collect(Collectors.groupingBy(Order::getStatus, Collectors.counting()));

        long newOrdersThisMonth = allOrders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(startOfMonth))
                .count();

        long totalCustomers = customerRepository.countByDeletedFalse();
        long newCustomersThisMonth = customerRepository.countByCreatedAtAfterAndDeletedFalse(startOfMonth);

        return new StatsResponse(
                totalOrders,
                totalCustomers,
                totalRevenue,
                ordersByStatus,
                newCustomersThisMonth,
                newOrdersThisMonth
        );
    }
}