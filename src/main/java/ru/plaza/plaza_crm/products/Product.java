package ru.plaza.plaza_crm.products;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import ru.plaza.plaza_crm.util.exception.BadRequestException;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter
@Setter
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private BigDecimal price;
    private String car; //TODO переделать под класс Car когда появится

    @Column(name = "stock_quantity")
    private int stockQuantity;


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
