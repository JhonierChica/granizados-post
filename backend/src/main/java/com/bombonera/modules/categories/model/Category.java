package com.bombonera.modules.categories.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "categoria")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria")
    private Long id;

    @Column(name = "nombre_categoria", nullable = false, length = 30)
    private String name;

    @Column(name = "estado", nullable = false, length = 1)
    private String status = "A"; // A=Activo, I=Inactivo

    @Column(name = "descripcion", length = 30)
    private String description;
    
    @Column(name = "orden_visualizacion")
    private Integer displayOrder;
    
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
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
