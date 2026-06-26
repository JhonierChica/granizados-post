package com.bombonera.modules.orders.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    private Long clientId;
    private Long userId; // Usuario que crea el pedido
    private Long tableId;
    private String orderType; // ESTABLECIMIENTO o DOMICILIO
    private List<OrderItemRequest> items;
    private String notes;
}
