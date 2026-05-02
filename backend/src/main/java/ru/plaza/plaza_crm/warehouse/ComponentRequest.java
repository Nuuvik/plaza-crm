package ru.plaza.plaza_crm.warehouse;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ComponentRequest {

    @NotBlank(message = "Артикул не может быть пустым")
    @Size(max = 50)
    private String sku;

    @NotBlank(message = "Название не может быть пустым")
    private String name;

    @Min(value = 0, message = "Остаток не может быть отрицательным")
    private int stockQuantity;
}