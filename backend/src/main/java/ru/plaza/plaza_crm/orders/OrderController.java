package ru.plaza.plaza_crm.orders;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/orders")
public class OrderController {
    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@Valid @RequestBody OrderRequest request) {
        return orderService.createOrder(request);
    }

    @GetMapping("/{id}")
    public OrderResponse getOrder(@PathVariable Long id) {
        return orderService.getOrder(id);
    }

    @GetMapping
    public Page<OrderListResponse> getOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            Pageable pageable) {
        return orderService.getOrders(status, customerId, from, to, pageable);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
    }

    @PatchMapping("/{id}/confirm")
    public OrderResponse confirmOrder(@PathVariable Long id) {
        return orderService.confirmOrder(id);
    }

    @PatchMapping("/{id}/cancel")
    public OrderResponse cancelOrder(@PathVariable Long id) {
        return orderService.cancelOrder(id);
    }

    @PatchMapping("/{id}/ship")
    public OrderResponse shipOrder(@PathVariable Long id) {
        return orderService.shipOrder(id);
    }

    @PatchMapping("/{id}/complete")
    public OrderResponse completeOrder(@PathVariable Long id) {
        return orderService.completeOrder(id);
    }

    @PatchMapping("/{id}/payment")
    public OrderResponse updatePayment(@PathVariable Long id, @RequestBody UpdatePaymentRequest request) {
        return orderService.updatePayment(id, request.isPaid());
    }

    @PatchMapping("/{id}/notes")
    public OrderResponse updateNotes(@PathVariable Long id, @Valid @RequestBody UpdateNotesRequest request) {
        return orderService.updateNotes(id, request);
    }

    @PostMapping("/{id}/items")
    public OrderResponse addItem(@PathVariable Long id, @Valid @RequestBody OrderItemRequest request) {
        return orderService.addItem(id, request.getProductId(), request.getQuantity());
    }

    @PutMapping("/{id}/items")
    public OrderResponse updateItem(@PathVariable Long id, @Valid @RequestBody OrderItemRequest request) {
        return orderService.updateItem(id, request.getProductId(), request.getQuantity());
    }

    @DeleteMapping("/{id}/items/{productId}")
    public OrderResponse removeItem(@PathVariable Long id, @PathVariable Long productId) {
        return orderService.removeItem(id, productId);
    }
}