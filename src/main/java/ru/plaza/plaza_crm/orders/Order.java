package ru.plaza.plaza_crm.orders;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import ru.plaza.plaza_crm.customers.Customer;
import ru.plaza.plaza_crm.util.exception.BadRequestException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //Optimistic locking
    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    private Customer customer;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    private BigDecimal totalAmount = BigDecimal.ZERO;


    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
        recalculateTotal();
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
        recalculateTotal();
    }

    public void confirm() {
        if (status != OrderStatus.NEW) {
            throw new BadRequestException("Only NEW orders can be confirmed");
        }
        this.status = OrderStatus.CONFIRMED;
    }

    public void markAsPaid() {
        if (status != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order must be confirmed before payment");
        }
        this.status = OrderStatus.PAID;
    }

    public void ship() {
        if (status != OrderStatus.PAID) {
            throw new BadRequestException("Order must be paid before shipping");
        }
        this.status = OrderStatus.SHIPPED;
    }

    public void cancel() {

        if (status == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order already cancelled");
        }

        if (status == OrderStatus.SHIPPED) {
            throw new BadRequestException("Shipped orders cannot be cancelled");
        }

        // Возвращаем stock
        for (OrderItem item : items) {
            item.getProduct().increaseStock(item.getQuantity());
        }

        this.status = OrderStatus.CANCELLED;
    }

    public void recalculateTotal() {
        totalAmount = items.stream()
                .map(i -> i.getUnitPrice()
                        .multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
