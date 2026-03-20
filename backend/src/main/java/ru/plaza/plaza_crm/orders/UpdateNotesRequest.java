package ru.plaza.plaza_crm.orders;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateNotesRequest {

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;
}