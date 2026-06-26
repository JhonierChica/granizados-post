package com.bombonera.modules.orders.dto;

import com.bombonera.modules.orders.model.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long clientId;
    private String clientName;
    private String clientPhone;
    private String clientAddress;
    private Long tableId;
    private Integer tableNumber;
    private Order.OrderStatus status;
    private String orderType; // ESTABLECIMIENTO o DOMICILIO
    private Float total; // Total a pagar
    private List<OrderItemResponse> items;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String waiterName;
}
