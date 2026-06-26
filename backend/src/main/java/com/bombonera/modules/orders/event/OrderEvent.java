package com.bombonera.modules.orders.event;

import com.bombonera.modules.orders.dto.OrderResponse;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Base event class for all order lifecycle events.
 * Extends Spring's ApplicationEvent for integration with ApplicationEventPublisher.
 */
@Getter
public abstract class OrderEvent extends ApplicationEvent {

    private final OrderResponse orderResponse;

    public OrderEvent(Object source, OrderResponse orderResponse) {
        super(source);
        this.orderResponse = orderResponse;
    }
}
