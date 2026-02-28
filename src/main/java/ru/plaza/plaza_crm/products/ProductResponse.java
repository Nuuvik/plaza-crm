package ru.plaza.plaza_crm.products;

import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class ProductResponse {

    private Long id;
    private String name;
    private BigDecimal price;
    private String car;
    private int stockQuantity;

    public ProductResponse(Long id, String name, BigDecimal price, String car, int stockQuantity) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.car = car;
        this.stockQuantity = stockQuantity;
    }

}