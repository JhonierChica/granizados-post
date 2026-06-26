package com.bombonera.modules.orders.event;

import lombok.Getter;

/**
 * Fired when an order is deleted.
 * Only carries the orderId since the order no longer exists.
 */
@Getter
public class OrderDeletedEvent extends OrderEvent {

    private final Long orderId;

    public OrderDeletedEvent(Object source, Long orderId) {
        super(source, null);
        this.orderId = orderId;
    }
}
