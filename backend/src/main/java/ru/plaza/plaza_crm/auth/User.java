package ru.plaza.plaza_crm.auth;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import ru.plaza.plaza_crm.util.BaseEntity;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;
}