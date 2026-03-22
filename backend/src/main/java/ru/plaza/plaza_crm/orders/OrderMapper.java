package ru.plaza.plaza_crm.orders;

import java.util.List;

public class OrderMapper {
    public static OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .filter(i -> !Boolean.TRUE.equals(i.getDeleted()))
                .map(OrderItemMapper::toResponse)
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getCustomer().getId(),
                order.getCustomer().getName(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                order.getNotes(),
                items
        );
    }

    public static OrderListResponse toListResponse(Order order) {
        return new OrderListResponse(
                order.getId(),
                order.getCustomer().getId(),
                order.getCustomer().getName(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                order.getNotes()
        );
    }
}

