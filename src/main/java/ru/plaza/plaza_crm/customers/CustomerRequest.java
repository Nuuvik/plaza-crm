package ru.plaza.plaza_crm.customers;


import lombok.Data;

@Data
public class CustomerRequest {
    private String name;
    private String email;
    private String phone;
    private String telegram;
}
