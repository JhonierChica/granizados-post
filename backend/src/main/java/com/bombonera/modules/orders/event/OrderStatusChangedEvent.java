package com.bombonera.modules.orders.event;

import com.bombonera.modules.orders.dto.OrderResponse;
import lombok.Getter;

/**
 * Fired when an order's status changes (PENDIENTE → SERVIDO → PAGADO).
 * Carries the order ID, the old and new status values, and the updated OrderResponse.
 */
@Getter
public class OrderStatusChangedEvent extends OrderEvent {

    private final Long orderId;
    private final String oldStatus;
    private final String newStatus;

    public OrderStatusChangedEvent(Object source, Long orderId, String oldStatus,
                                   String newStatus, OrderResponse orderResponse) {
        super(source, orderResponse);
        this.orderId = orderId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
    }
}
