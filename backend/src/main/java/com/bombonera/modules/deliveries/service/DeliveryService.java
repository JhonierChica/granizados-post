package com.bombonera.modules.deliveries.service;

import com.bombonera.modules.deliveries.dto.CreateDeliveryRequest;
import com.bombonera.modules.deliveries.dto.DeliveryResponse;
import com.bombonera.modules.deliveries.dto.UpdateDeliveryStatusRequest;
import com.bombonera.modules.deliveries.event.DeliveryCreatedEvent;
import com.bombonera.modules.deliveries.event.DeliveryStatusChangedEvent;
import com.bombonera.modules.deliveries.model.Delivery;
import com.bombonera.modules.deliveries.model.Delivery.DeliveryStatus;
import com.bombonera.modules.deliveries.repository.DeliveryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeliveryService {

    private static final Logger log = LoggerFactory.getLogger(DeliveryService.class);

    private final DeliveryRepository deliveryRepository;
    private final ApplicationEventPublisher publisher;

    public DeliveryService(DeliveryRepository deliveryRepository,
                           ApplicationEventPublisher publisher) {
        this.deliveryRepository = deliveryRepository;
        this.publisher = publisher;
    }

    @Transactional
    public DeliveryResponse createDelivery(CreateDeliveryRequest request) {
        Delivery delivery = new Delivery();
        delivery.setOrderId(request.getOrderId());
        delivery.setStatus(DeliveryStatus.PENDING);

        Delivery savedDelivery = deliveryRepository.save(delivery);
        DeliveryResponse response = mapToResponse(savedDelivery);

        // Publish WebSocket event for real-time delivery creation
        publisher.publishEvent(new DeliveryCreatedEvent(
                this, savedDelivery.getId(), savedDelivery.getOrderId(), response));

        return response;
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> getAllDeliveries() {
        try {
            log.debug("getAllDeliveries() called");
            List<Delivery> deliveries = deliveryRepository.findAllOrderByCreatedAtDesc();
            log.debug("Found {} deliveries in database", deliveries.size());
            
            List<DeliveryResponse> responses = deliveries.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
            
            log.debug("Mapped to {} responses", responses.size());
            return responses;
        } catch (Exception e) {
            log.error("Error in getAllDeliveries: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public DeliveryResponse getDeliveryById(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Domicilio no encontrado con id: " + id));
        return mapToResponse(delivery);
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> getActiveDeliveries() {
        List<DeliveryStatus> activeStatuses = List.of(
                DeliveryStatus.PENDING,
                DeliveryStatus.DELIVERED
        );
        return deliveryRepository.findByStatusInOrderByCreatedAtDesc(activeStatuses)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> getDeliveriesByStatus(String statusString) {
        DeliveryStatus status = DeliveryStatus.valueOf(statusString.toUpperCase());
        return deliveryRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> getDeliveriesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return deliveryRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(startDate, endDate)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DeliveryResponse getDeliveryByOrderId(Long orderId) {
        Delivery delivery = deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("No se encontró domicilio para la orden: " + orderId));
        return mapToResponse(delivery);
    }

    @Transactional
    public DeliveryResponse updateDeliveryStatus(Long id, UpdateDeliveryStatusRequest request) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Domicilio no encontrado con id: " + id));

        String oldStatus = delivery.getStatus().name();
        DeliveryStatus newStatus = DeliveryStatus.valueOf(request.getStatus().toUpperCase());
        delivery.setStatus(newStatus);

        Delivery updatedDelivery = deliveryRepository.save(delivery);
        DeliveryResponse response = mapToResponse(updatedDelivery);

        // Publish WebSocket event
        publisher.publishEvent(new DeliveryStatusChangedEvent(
                this, id, delivery.getOrderId(),
                oldStatus, newStatus.name(), response));

        return response;
    }

    private DeliveryResponse mapToResponse(Delivery delivery) {
        try {
            log.trace("Mapping delivery ID: {}, OrderID: {}", delivery.getId(), delivery.getOrderId());
            DeliveryResponse response = new DeliveryResponse();
            response.setId(delivery.getId());
            response.setOrderId(delivery.getOrderId());
            response.setStatus(delivery.getStatus().name());
            response.setCreatedAt(delivery.getCreatedAt());
            return response;
        } catch (Exception e) {
            log.error("Error mapping delivery ID {}: {}", delivery.getId(), e.getMessage(), e);
            throw e;
        }
    }
}
