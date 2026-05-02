package ru.plaza.plaza_crm.products;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import ru.plaza.plaza_crm.cars.Car;
import ru.plaza.plaza_crm.util.BaseEntity;
import ru.plaza.plaza_crm.util.exception.BadRequestException;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter
@Setter
public class Product extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sku;

    private String name;
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id")
    private Car car;

    @Column(name = "stock_quantity")
    private int stockQuantity;

    private String additions;

    @Column(nullable = false)
    private boolean archived = false;

    public void decreaseStock(int qty) {
        if (stockQuantity < qty) {
            throw new BadRequestException("Not enough stock");
        }
        stockQuantity -= qty;
    }

    public void increaseStock(int qty) {
        stockQuantity += qty;
    }

}
