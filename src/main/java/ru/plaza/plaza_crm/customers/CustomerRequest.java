package ru.plaza.plaza_crm.customers;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerRequest {

    @NotBlank(message = "Customer name cannot be empty")
    @Size(max = 150)
    private String name;

    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Customer phone cannot be empty")
    @Size(max = 20)
    private String phone;

    @Size(max = 20)
    private String telegram;

    private String address;
}
