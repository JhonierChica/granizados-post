package com.bombonera.modules.deliveries.event;

import com.bombonera.modules.deliveries.dto.DeliveryResponse;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Fired when a new delivery is created (usually from a DOMICILIO order).
 * Carries the delivery response after creation.
 */
@Getter
public class DeliveryCreatedEvent extends ApplicationEvent {

    private final Long deliveryId;
    private final Long orderId;
    private final DeliveryResponse deliveryResponse;

    public DeliveryCreatedEvent(Object source, Long deliveryId, Long orderId,
                                DeliveryResponse deliveryResponse) {
        super(source);
        this.deliveryId = deliveryId;
        this.orderId = orderId;
        this.deliveryResponse = deliveryResponse;
    }
}
