package ru.plaza.plaza_crm.cars;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import ru.plaza.plaza_crm.util.BaseEntity;

@Entity
@Table(name = "cars")
@Getter
@Setter
public class Car extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String model;
}