package ru.plaza.plaza_crm.warehouse;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductComponentRequest {

    @NotNull(message = "Компонент не указан")
    private Long componentId;

    @Min(value = 1, message = "Количество должно быть не менее 1")
    private int quantity;
}