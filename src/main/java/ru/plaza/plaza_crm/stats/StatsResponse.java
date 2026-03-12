package ru.plaza.plaza_crm.stats;

import lombok.AllArgsConstructor;
import lombok.Getter;
import ru.plaza.plaza_crm.orders.OrderStatus;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@AllArgsConstructor
public class StatsResponse {
    private long totalOrders;
    private long totalCustomers;
    private BigDecimal totalRevenue;
    private Map<OrderStatus, Long> ordersByStatus;
    private long newCustomersThisMonth;
    private long newOrdersThisMonth;
}