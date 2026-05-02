package ru.plaza.plaza_crm.cars;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CarRequest {

    @NotBlank(message = "Марка не может быть пустой")
    @Size(max = 100)
    private String brand;

    @NotBlank(message = "Модель не может быть пустой")
    @Size(max = 100)
    private String model;
}