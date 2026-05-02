package ru.plaza.plaza_crm.warehouse;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import ru.plaza.plaza_crm.products.Product;

@Entity
@Table(name = "product_components")
@Getter
@Setter
public class ProductComponent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_id", nullable = false)
    private Component component;

    @Column(nullable = false)
    private int quantity;
}