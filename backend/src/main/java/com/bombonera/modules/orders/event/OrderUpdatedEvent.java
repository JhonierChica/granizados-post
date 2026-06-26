package com.bombonera.modules.orders.event;

import com.bombonera.modules.orders.dto.OrderResponse;

/**
 * Fired when an existing order is updated (items, notes, or other fields changed).
 * Carries the complete updated OrderResponse.
 */
public class OrderUpdatedEvent extends OrderEvent {

    public OrderUpdatedEvent(Object source, OrderResponse orderResponse) {
        super(source, orderResponse);
    }
}
