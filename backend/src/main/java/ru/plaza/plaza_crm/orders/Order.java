package ru.plaza.plaza_crm.orders;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import ru.plaza.plaza_crm.customers.Customer;
import ru.plaza.plaza_crm.products.Product;
import ru.plaza.plaza_crm.util.BaseEntity;
import ru.plaza.plaza_crm.util.exception.BadRequestException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
public class Order extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Setter
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Setter
    @Column(length = 1000)
    private String notes;

    @Setter
    private String source;

    @Setter
    private LocalDateTime paymentDate;

    @Setter
    private String paymentMethod;

    @Setter
    private boolean isPaid = false;

    public void initAsNew(Customer customer) {
        this.customer = customer;
        this.status = OrderStatus.NEW;
        this.source = "CRM";
    }

    public void confirm() {
        if (status != OrderStatus.NEW) {
            throw new BadRequestException("Only NEW orders can be confirmed");
        }
        this.status = OrderStatus.CONFIRMED;
    }

    public void ship() {
        if (status != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order must be confirmed before shipping");
        }
        this.status = OrderStatus.SHIPPED;
    }

    public void complete() {
        if (status != OrderStatus.SHIPPED) {
            throw new BadRequestException("Order must be shipped before completing");
        }
        this.status = OrderStatus.COMPLETED;
    }

    public void cancel() {
        if (status == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order already cancelled");
        }
        if (status == OrderStatus.SHIPPED || status == OrderStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a shipped or completed order");
        }
        for (OrderItem item : items) {
            if (!Boolean.TRUE.equals(item.getDeleted())) {
                item.getProduct().increaseStock(item.getQuantity());
            }
        }
        this.status = OrderStatus.CANCELLED;
    }

    public void recalculateTotal() {
        totalAmount = items.stream()
                .filter(i -> !Boolean.TRUE.equals(i.getDeleted()))
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void removeItem(Long productId) {
        ensureEditable();
        OrderItem item = findActiveItemByProduct(productId);
        if (item == null) throw new BadRequestException("Item not found in order");
        item.setDeleted(true);
        item.getProduct().increaseStock(item.getQuantity());
        recalculateTotal();
    }

    private void ensureEditable() {
        if (status != OrderStatus.NEW) {
            throw new BadRequestException("Only NEW orders can be modified");
        }
    }

    public OrderItem findActiveItemByProduct(Long productId) {
        return items.stream()
                .filter(i -> !Boolean.TRUE.equals(i.getDeleted()))
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElse(null);
    }

    public void addOrIncreaseItem(Product product, int quantity) {
        ensureEditable();
        OrderItem existing = findActiveItemByProduct(product.getId());
        if (existing != null) {
            updateItemQuantity(product.getId(), existing.getQuantity() + quantity);
            return;
        }
        product.decreaseStock(quantity);
        OrderItem item = new OrderItem();
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setUnitPrice(product.getPrice());
        items.add(item);
        item.setOrder(this);
        recalculateTotal();
    }

    public void updateItemQuantity(Long productId, int newQuantity) {
        ensureEditable();
        OrderItem item = findActiveItemByProduct(productId);
        if (item == null) throw new BadRequestException("Item not found in order");
        int diff = newQuantity - item.getQuantity();
        if (diff > 0) item.getProduct().decreaseStock(diff);
        else if (diff < 0) item.getProduct().increaseStock(Math.abs(diff));
        item.setQuantity(newQuantity);
        recalculateTotal();
    }
}