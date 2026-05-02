package ru.plaza.plaza_crm.warehouse;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import ru.plaza.plaza_crm.products.Product;
import ru.plaza.plaza_crm.util.BaseEntity;

@Entity
@Table(name = "assembly_logs")
@Getter
@Setter
public class AssemblyLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int quantity;

    private String username;
}