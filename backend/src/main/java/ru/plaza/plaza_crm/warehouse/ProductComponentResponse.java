package ru.plaza.plaza_crm.warehouse;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProductComponentResponse {
    private Long id;
    private Long componentId;
    private String componentSku;
    private String componentName;
    private int quantity;
}