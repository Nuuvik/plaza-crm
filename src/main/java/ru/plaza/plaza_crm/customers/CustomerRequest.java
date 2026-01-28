package ru.plaza.plaza_crm.customers;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerRequest {
    private String name;
    private String email;
    private String phone;
    private String telegram;
}
