package com.bombonera.modules.menu.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "item_presentations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemPresentation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_presentacion")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_menu", nullable = false)
    private MenuItem menuItem;

    @Column(name = "nombre", nullable = false, length = 50)
    private String name;

    @Column(name = "precio", nullable = false)
    private Float price;

    @Column(name = "disponible", nullable = false)
    private Boolean available = true;

    public BigDecimal getPriceAsBigDecimal() {
        return price != null ? BigDecimal.valueOf(price) : BigDecimal.ZERO;
    }

    public void setPriceFromBigDecimal(BigDecimal price) {
        this.price = price != null ? price.floatValue() : 0f;
    }
}
