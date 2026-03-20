package ru.plaza.plaza_crm.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private Role role;
    private LocalDateTime createdAt;
}