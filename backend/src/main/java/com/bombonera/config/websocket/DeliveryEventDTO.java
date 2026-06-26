package com.bombonera.config.websocket;

import com.bombonera.modules.deliveries.dto.DeliveryResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * JSON payload sent over the /topic/deliveries STOMP destination.
 * Contains the event type discriminator, server timestamp, and typed data payload.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryEventDTO {

    private String eventType;
    private LocalDateTime timestamp;
    private Object data;

    public static DeliveryEventDTO forStatusChanged(Long deliveryId, Long orderId,
                                                     String oldStatus, String newStatus,
                                                     DeliveryResponse delivery) {
        Map<String, Object> payload = Map.of(
                "deliveryId", deliveryId,
                "orderId", orderId,
                "oldStatus", oldStatus,
                "newStatus", newStatus,
                "delivery", delivery
        );
        return new DeliveryEventDTO("DELIVERY_STATUS_CHANGED", LocalDateTime.now(), payload);
    }

    public static DeliveryEventDTO forCreated(Long deliveryId, Long orderId,
                                               DeliveryResponse delivery) {
        Map<String, Object> payload = Map.of(
                "deliveryId", deliveryId,
                "orderId", orderId,
                "delivery", delivery
        );
        return new DeliveryEventDTO("DELIVERY_CREATED", LocalDateTime.now(), payload);
    }
}
