package com.bombonera.modules.orders.event.dto;

import com.bombonera.modules.orders.dto.OrderResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * JSON payload sent over the /topic/orders STOMP destination.
 * Contains the event type discriminator, server timestamp, and typed data payload.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderEventDTO {

    private String eventType;
    private LocalDateTime timestamp;
    private Object data;

    public static OrderEventDTO forCreated(OrderResponse order) {
        return new OrderEventDTO("ORDER_CREATED", LocalDateTime.now(), order);
    }

    public static OrderEventDTO forStatusChanged(Long orderId, String oldStatus,
                                                  String newStatus, OrderResponse order) {
        Map<String, Object> payload = Map.of(
                "orderId", orderId,
                "oldStatus", oldStatus,
                "newStatus", newStatus,
                "order", order
        );
        return new OrderEventDTO("ORDER_STATUS_CHANGED", LocalDateTime.now(), payload);
    }

    public static OrderEventDTO forUpdated(OrderResponse order) {
        return new OrderEventDTO("ORDER_UPDATED", LocalDateTime.now(), order);
    }

    public static OrderEventDTO forDeleted(Long orderId) {
        Map<String, Object> payload = Map.of("orderId", orderId);
        return new OrderEventDTO("ORDER_DELETED", LocalDateTime.now(), payload);
    }
}
