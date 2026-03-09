package ru.plaza.plaza_crm.orders;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
public class OrderController {
    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public OrderResponse createOrder(@Valid @RequestBody OrderRequest request) {
        return orderService.createOrder(request);
    }

    @GetMapping("/{id}")
    public OrderResponse getOrder(@PathVariable Long id) {
        return orderService.getOrder(id);
    }

    @GetMapping
    public Page<OrderResponse> getOrders(@RequestParam(required = false) OrderStatus status,
                                         @RequestParam(required = false) Long customerId, Pageable pageable) {
        return orderService.getOrders(status, customerId, pageable);
    }

    @DeleteMapping("/{id}")
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

    @PatchMapping("/{id}/pay")
    public OrderResponse payOrder(@PathVariable Long id) {
        return orderService.payOrder(id);
    }

    @PatchMapping("/{id}/ship")
    public OrderResponse shipOrder(@PathVariable Long id) {
        return orderService.shipOrder(id);
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
