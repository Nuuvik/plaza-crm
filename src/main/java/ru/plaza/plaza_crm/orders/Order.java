package ru.plaza.plaza_crm.orders;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
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

    @ManyToOne
    private Customer customer;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    private BigDecimal totalAmount = BigDecimal.valueOf(0);


    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);

        BigDecimal itemTotal = item.getUnitPrice()
                .multiply(BigDecimal.valueOf(item.getQuantity()));

        totalAmount = totalAmount.add(itemTotal);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }

    public void confirm() {
        if (status != OrderStatus.NEW) {
            throw new BadRequestException("Cannot confirm order");
        }
        status = OrderStatus.CONFIRMED;
    }

    public void cancel() {
        if (status == OrderStatus.CANCELLED) {
            throw new BadRequestException("Already cancelled");
        }

        for (OrderItem item : items) {
            item.getProduct().increaseStock(item.getQuantity());
        }
        status = OrderStatus.CANCELLED;
    }


}
