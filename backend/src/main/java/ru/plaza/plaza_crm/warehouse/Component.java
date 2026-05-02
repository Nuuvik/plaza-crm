package ru.plaza.plaza_crm.warehouse;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import ru.plaza.plaza_crm.util.BaseEntity;

@Entity
@Table(name = "components")
@Getter
@Setter
public class Component extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String sku;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int stockQuantity;

    public void increaseStock(int qty) {
        this.stockQuantity += qty;
    }

    public void decreaseStock(int qty) {
        if (this.stockQuantity < qty) {
            throw new ru.plaza.plaza_crm.util.exception.BadRequestException(
                    "Недостаточно компонента «" + this.name + "»: " +
                            "нужно " + qty + ", есть " + this.stockQuantity
            );
        }
        this.stockQuantity -= qty;
    }
}