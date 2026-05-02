package ru.plaza.plaza_crm.warehouse;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class AssemblyLogResponse {
    private Long id;
    private Long productId;
    private String productName;
    private int quantity;
    private String username;
    private LocalDateTime createdAt;
}