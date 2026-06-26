package com.bombonera.modules.orders.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

/**
 * Clave compuesta para OrderItem
 * Representa la clave primaria compuesta de la tabla detallePedido (id_pedido, id_menu)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemId implements Serializable {
    private Long order;
    private Long menuItem;
}
