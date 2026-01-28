package ru.plaza.plaza_crm.orders;

import java.math.BigDecimal;
import java.util.List;

public class OrderMapper {
    public static OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(OrderItemMapper::toResponse)
                .toList();

        BigDecimal totalPrice = items.stream()
                .map(OrderItemResponse::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new OrderResponse(
                order.getId(),
                order.getCustomer().getId(),
                order.getStatus(),
                totalPrice,
                items
        );
    }
}

