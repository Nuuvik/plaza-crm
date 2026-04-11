package ru.plaza.plaza_crm.orders;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private OrderStatus status;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;
    private String notes;
    private boolean paid;
    private String source;
    private LocalDateTime paymentDate;
    private String paymentMethod;
    private List<OrderItemResponse> items;
}