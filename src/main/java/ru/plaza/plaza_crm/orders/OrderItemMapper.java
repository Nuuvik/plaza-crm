package ru.plaza.plaza_crm.orders;

import java.math.BigDecimal;

public class OrderItemMapper {
    public static OrderItemResponse toResponse(OrderItem item) {
        BigDecimal totalPrice = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));

        return new OrderItemResponse(
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getQuantity(),
                item.getUnitPrice(),
                totalPrice
        );
    }
}
