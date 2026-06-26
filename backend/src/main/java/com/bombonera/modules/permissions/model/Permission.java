package com.bombonera.modules.permissions.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Permission representa una acción específica que se puede realizar en el sistema.
 * Ejemplos: "orders.create", "orders.view", "payments.close", "menu.edit"
 */
@Entity
@Table(name = "permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String code; // Ej: "orders.create", "payments.close"

    @Column(nullable = false, length = 150)
    private String name; // Ej: "Crear Pedidos", "Cerrar Caja"

    @Column(length = 255)
    private String description;

    @Column(nullable = false, length = 50)
    private String module; // Ej: "orders", "payments", "menu", "users"

    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
