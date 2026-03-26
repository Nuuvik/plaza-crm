package ru.plaza.plaza_crm.products;

import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class ProductResponse {

    private Long id;
    private String sku;
    private String name;
    private BigDecimal price;
    private String car;
    private int stockQuantity;
    private String additions;

    public ProductResponse(Long id, String sku, String name, BigDecimal price, String car, int stockQuantity, String additions) {
        this.id = id;
        this.sku = sku;
        this.name = name;
        this.price = price;
        this.car = car;
        this.stockQuantity = stockQuantity;
        this.additions = additions;
    }
}