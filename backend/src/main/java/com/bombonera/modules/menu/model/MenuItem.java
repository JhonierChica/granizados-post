package com.bombonera.modules.menu.model;

import com.bombonera.modules.categories.model.Category;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "menu")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_menu")
    private Long id;

    @Column(name = "nombre_menu", nullable = false, length = 10)
    private String name;

    @Column(name = "descripcion", nullable = false, length = 30)
    private String description;

    @Column(name = "precio", nullable = false)
    private Float price; // Usar Float porque la BD usa REAL

    @ManyToOne
    @JoinColumn(name = "id_categoria", nullable = false)
    private Category category;

    @Column(name = "estado", nullable = false, length = 1)
    private String status = "A"; // A=Activo, I=Inactivo

    // Campos adicionales no mapeados a BD
    @Transient
    private String imageUrl;
    
    @Transient
    private Integer preparationTime;
    
    @Transient
    private Boolean isVegetarian;
    
    @Transient
    private Boolean isVegan;
    
    @Transient
    private Boolean isGlutenFree;
    
    @Transient
    private Boolean isSpicy;
    
    @Transient
    private Integer calories;
    
    @Transient
    private LocalDateTime createdAt;
    
    @Transient
    private LocalDateTime updatedAt;
    
    // Método helper para compatibilidad
    public Boolean getAvailable() {
        return "A".equals(this.status);
    }
    
    public void setAvailable(Boolean available) {
        this.status = available ? "A" : "I";
    }
    
    // Helper para convertir Float a BigDecimal si es necesario
    public BigDecimal getPriceAsBigDecimal() {
        return price != null ? BigDecimal.valueOf(price) : BigDecimal.ZERO;
    }
    
    public void setPriceFromBigDecimal(BigDecimal price) {
        this.price = price != null ? price.floatValue() : 0f;
    }
}
