package com.bombonera.modules.orders.model;

import com.bombonera.modules.menu.model.MenuItem;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "`detallePedido`")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(OrderItemId.class)
public class OrderItem {

    @Id
    @ManyToOne
    @JoinColumn(name = "id_pedido", nullable = false)
    private Order order;

    @Id
    @ManyToOne
    @JoinColumn(name = "id_menu", nullable = false)
    private MenuItem menuItem;

    @Column(name = "cantidad", nullable = false)
    private Integer quantity;

    @Column(name = "precio_unitario", nullable = false)
    private Float unitPrice; // Usar Float porque la BD usa REAL

    @Column(name = "id_presentacion", nullable = true)
    private Long presentationId;

    @Column(name = "presentacion", nullable = true, length = 50)
    private String presentationName;

    @Column(name = "estado", nullable = false, length = 1)
    private String status = "A"; // A=Activo, C=Cancelado

    // Campos adicionales no mapeados a BD
    @Transient
    private String specialInstructions;
    
    // Método helper para compatibilidad - ID virtual para sistemas que lo necesiten
    @Transient
    public Long getId() {
        // Retorna un hash único basado en order y menuItem IDs
        if (order != null && menuItem != null && order.getId() != null && menuItem.getId() != null) {
            return Long.valueOf(String.valueOf(order.getId()) + String.format("%05d", menuItem.getId()));
        }
        return null;
    }
    
    // Método helper para compatibilidad
    public Boolean getActive() {
        return "A".equals(this.status);
    }
    
    public void setActive(Boolean active) {
        this.status = active ? "A" : "C";
    }
}
