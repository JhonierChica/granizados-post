package com.bombonera.modules.orders.event;

import com.bombonera.modules.orders.dto.OrderResponse;

/**
 * Fired after a new order is created and persisted.
 * Carries the complete OrderResponse for the newly created order.
 */
public class OrderCreatedEvent extends OrderEvent {

    public OrderCreatedEvent(Object source, OrderResponse orderResponse) {
        super(source, orderResponse);
    }
}
