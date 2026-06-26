package com.bombonera.modules.deliveries.event;

import com.bombonera.modules.deliveries.dto.DeliveryResponse;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Fired when a delivery's status changes (PENDING → DELIVERED).
 * Carries the delivery response after the change.
 */
@Getter
public class DeliveryStatusChangedEvent extends ApplicationEvent {

    private final Long deliveryId;
    private final Long orderId;
    private final String oldStatus;
    private final String newStatus;
    private final DeliveryResponse deliveryResponse;

    public DeliveryStatusChangedEvent(Object source, Long deliveryId, Long orderId,
                                      String oldStatus, String newStatus,
                                      DeliveryResponse deliveryResponse) {
        super(source);
        this.deliveryId = deliveryId;
        this.orderId = orderId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.deliveryResponse = deliveryResponse;
    }
}
