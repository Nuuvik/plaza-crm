package ru.plaza.plaza_crm.customers;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CustomerResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String telegram;
    private String address;
    private LocalDateTime createdAt;
}
