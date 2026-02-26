package ru.plaza.plaza_crm.auth;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private Role role;
}