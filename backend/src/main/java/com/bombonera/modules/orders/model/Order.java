package com.bombonera.modules.orders.model;

import com.bombonera.modules.clients.model.Client;
import com.bombonera.modules.tables.model.RestaurantTable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    private Client client;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private com.bombonera.modules.users.model.User user; // Usuario que creó el pedido

    @Column(name = "`valor a pagar`", nullable = false)
    private Float totalAmount; // Usar Float porque la BD usa REAL

    @ManyToOne
    @JoinColumn(name = "id_mesa")
    private RestaurantTable table;

    @Column(name = "estado", nullable = false, length = 1)
    private String status = "P"; // P=Pendiente, S=Servido, X=Pagado

    @Column(name = "tipo_pedido", length = 20)
    private String orderType = "ESTABLECIMIENTO"; // ESTABLECIMIENTO o DOMICILIO

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Column(name = "notas")
    private String notes;
    
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        ZoneId colombia = ZoneId.of("America/Bogota");
        LocalDateTime now = LocalDateTime.now(colombia);
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now(ZoneId.of("America/Bogota"));
    }
    
    // Métodos helper para compatibilidad con OrderStatus enum
    public OrderStatus getOrderStatus() {
        if ("S".equals(status)) return OrderStatus.SERVIDO;
        if ("X".equals(status)) return OrderStatus.PAGADO;
        return OrderStatus.PENDIENTE;
    }
    
    public void setOrderStatus(OrderStatus orderStatus) {
        switch (orderStatus) {
            case SERVIDO: this.status = "S"; break;
            case PAGADO: this.status = "X"; break;
            default: this.status = "P";
        }
    }
    
    // Helper para convertir Float a BigDecimal si es necesario
    public BigDecimal getTotalAmountAsBigDecimal() {
        return totalAmount != null ? BigDecimal.valueOf(totalAmount) : BigDecimal.ZERO;
    }
    
    public void setTotalAmountFromBigDecimal(BigDecimal amount) {
        this.totalAmount = amount != null ? amount.floatValue() : 0f;
    }

    public enum OrderStatus {
        PENDIENTE,
        SERVIDO,
        PAGADO
    }

    public enum OrderType {
        ESTABLECIMIENTO,
        DOMICILIO
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }
}
