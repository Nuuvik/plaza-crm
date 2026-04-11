package ru.plaza.plaza_crm.orders;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UpdateOrderDetailsRequest {
    private String source;
    private String paymentMethod;
    private LocalDateTime paymentDate;
}