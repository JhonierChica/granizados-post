package com.bombonera.modules.positions.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Position representa un cargo o puesto laboral dentro del restaurante.
 * Define QUÉ hace la persona en el organigrama y responsabilidades físicas.
 * Ejemplos: "Chef Ejecutivo", "Mesero", "Cajero", "Gerente de Piso"
 */
@Entity
@Table(name = "cargo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Position {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cargo")
    private Long id;

    @Column(name = "codigo", length = 50, unique = true)
    private String code; // Código único del cargo

    @Column(name = "nombre_cargo", nullable = false, length = 100)
    private String name; // Nombre del cargo

    @Column(name = "descripcion", length = 255)
    private String description; // Descripción del cargo

    @Column(name = "departamento", length = 50)
    private String department; // Departamento al que pertenece

    @Column(name = "salario_base", precision = 10, scale = 2)
    private BigDecimal baseSalary; // Salario base del cargo

    @Column(name = "responsabilidades", columnDefinition = "TEXT")
    private String responsibilities; // Responsabilidades del cargo

    @Column(name = "estado", nullable = false, length = 1)
    private String status = "A"; // A=Activo, I=Inactivo

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "A";
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Método helper para compatibilidad
    public Boolean getActive() {
        return "A".equals(this.status);
    }
    
    public void setActive(Boolean active) {
        this.status = active ? "A" : "I";
    }
}
