package com.bombonera.config.websocket;

import com.bombonera.modules.deliveries.event.DeliveryCreatedEvent;
import com.bombonera.modules.deliveries.event.DeliveryStatusChangedEvent;
import com.bombonera.modules.orders.event.OrderCreatedEvent;
import com.bombonera.modules.orders.event.OrderDeletedEvent;
import com.bombonera.modules.orders.event.OrderStatusChangedEvent;
import com.bombonera.modules.orders.event.OrderUpdatedEvent;
import com.bombonera.modules.orders.event.dto.OrderEventDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Listens for order and delivery lifecycle events and broadcasts them
 * to all connected WebSocket clients via STOMP destinations.
 *
 * Uses {@code @TransactionalEventListener(AFTER_COMMIT)} to guarantee
 * events are only sent after the database transaction succeeds.
 */
@Component
public class WebSocketEventHandler {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketEventHandler(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // ─── Order events ──────────────────────────────────────

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderCreated(OrderCreatedEvent event) {
        messagingTemplate.convertAndSend("/topic/orders",
                OrderEventDTO.forCreated(event.getOrderResponse()));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderStatusChanged(OrderStatusChangedEvent event) {
        messagingTemplate.convertAndSend("/topic/orders",
                OrderEventDTO.forStatusChanged(
                        event.getOrderId(),
                        event.getOldStatus(),
                        event.getNewStatus(),
                        event.getOrderResponse()));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderUpdated(OrderUpdatedEvent event) {
        messagingTemplate.convertAndSend("/topic/orders",
                OrderEventDTO.forUpdated(event.getOrderResponse()));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderDeleted(OrderDeletedEvent event) {
        messagingTemplate.convertAndSend("/topic/orders",
                OrderEventDTO.forDeleted(event.getOrderId()));
    }

    // ─── Delivery events ───────────────────────────────────

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleDeliveryCreated(DeliveryCreatedEvent event) {
        messagingTemplate.convertAndSend("/topic/deliveries",
                DeliveryEventDTO.forCreated(
                        event.getDeliveryId(),
                        event.getOrderId(),
                        event.getDeliveryResponse()));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleDeliveryStatusChanged(DeliveryStatusChangedEvent event) {
        messagingTemplate.convertAndSend("/topic/deliveries",
                DeliveryEventDTO.forStatusChanged(
                        event.getDeliveryId(),
                        event.getOrderId(),
                        event.getOldStatus(),
                        event.getNewStatus(),
                        event.getDeliveryResponse()));
    }
}
