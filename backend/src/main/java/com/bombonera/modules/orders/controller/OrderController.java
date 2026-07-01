package com.bombonera.modules.orders.controller;

import com.bombonera.modules.orders.dto.CreateOrderRequest;
import com.bombonera.modules.orders.dto.OrderResponse;
import com.bombonera.modules.orders.dto.UpdateOrderRequest;
import com.bombonera.modules.orders.model.Order;
import com.bombonera.modules.orders.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@PreAuthorize("hasAnyRole('ADMIN', 'WAITER', 'CASHIER')")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            log.debug("Create order request - ClientId: {}, UserId: {}, TableId: {}, OrderType: {}, Items: {}",
                    request.getClientId(), request.getUserId(), request.getTableId(),
                    request.getOrderType(), request.getItems() != null ? request.getItems().size() : 0);
            
            OrderResponse response = orderService.createOrder(request);
            log.info("Order created successfully with ID: {}", response.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("Error creating order: {}", e.getMessage(), e);
            throw new RuntimeException("Error creating order: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long clientId,
            @RequestParam(required = false) Long tableId) {
        
        if (status != null) {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(orderService.getOrdersByStatus(orderStatus));
        }
        
        if (clientId != null) {
            return ResponseEntity.ok(orderService.getOrdersByClient(clientId));
        }
        
        if (tableId != null) {
            return ResponseEntity.ok(orderService.getOrdersByTable(tableId));
        }
        
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/all-for-payments")
    public ResponseEntity<List<OrderResponse>> getAllOrdersForPayments() {
        // Endpoint específico para el módulo de pagos que incluye TODAS las órdenes
        return ResponseEntity.ok(orderService.getAllOrdersForPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        try {
            OrderResponse order = orderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> updateOrder(
            @PathVariable Long id,
            @RequestBody UpdateOrderRequest request) {
        try {
            OrderResponse response = orderService.updateOrder(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            throw new RuntimeException("Error updating order: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        try {
            log.debug("Update order status - Order ID: {}, Body: {}", id, body);
            String status = body.get("status");
            OrderResponse response = orderService.updateOrderStatus(id, status);
            log.info("Order {} status updated successfully", id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status update request for order {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            log.error("Error updating order status for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body(java.util.Map.of(
                "error", "Error updating order status: " + e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
