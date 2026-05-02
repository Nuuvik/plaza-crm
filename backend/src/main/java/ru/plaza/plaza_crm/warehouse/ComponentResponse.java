package ru.plaza.plaza_crm.warehouse;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ComponentResponse {
    private Long id;
    private String sku;
    private String name;
    private int stockQuantity;
}