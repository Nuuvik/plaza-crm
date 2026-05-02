package ru.plaza.plaza_crm.cars;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CarResponse {
    private Long id;
    private String brand;
    private String model;
}