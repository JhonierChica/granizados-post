package com.bombonera.modules.orders.service;

import com.bombonera.modules.clients.model.Client;
import com.bombonera.modules.clients.repository.ClientRepository;
import com.bombonera.modules.deliveries.dto.CreateDeliveryRequest;
import com.bombonera.modules.deliveries.service.DeliveryService;
import com.bombonera.modules.menu.model.ItemPresentation;
import com.bombonera.modules.menu.model.MenuItem;
import com.bombonera.modules.menu.repository.ItemPresentationRepository;
import com.bombonera.modules.menu.repository.MenuItemRepository;
import com.bombonera.modules.orders.dto.*;
import com.bombonera.modules.orders.event.OrderCreatedEvent;
import com.bombonera.modules.orders.event.OrderDeletedEvent;
import com.bombonera.modules.orders.event.OrderStatusChangedEvent;
import com.bombonera.modules.orders.event.OrderUpdatedEvent;
import com.bombonera.modules.orders.model.Order;
import com.bombonera.modules.orders.model.OrderItem;
import com.bombonera.modules.orders.repository.OrderRepository;
import com.bombonera.modules.tables.model.RestaurantTable;
import com.bombonera.modules.tables.repository.RestaurantTableRepository;
import com.bombonera.modules.users.model.User;
import com.bombonera.modules.users.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final EntityManager entityManager;
    private final OrderRepository orderRepository;
    private final ClientRepository clientRepository;
    private final RestaurantTableRepository tableRepository;
    private final MenuItemRepository menuItemRepository;
    private final ItemPresentationRepository itemPresentationRepository;
    private final UserRepository userRepository;
    private final DeliveryService deliveryService;
    private final ApplicationEventPublisher publisher;

    public OrderService(OrderRepository orderRepository, 
                       ClientRepository clientRepository,
                       RestaurantTableRepository tableRepository,
                       MenuItemRepository menuItemRepository,
                       ItemPresentationRepository itemPresentationRepository,
                       UserRepository userRepository,
                       DeliveryService deliveryService,
                       EntityManager entityManager,
                       ApplicationEventPublisher publisher) {
        this.orderRepository = orderRepository;
        this.clientRepository = clientRepository;
        this.tableRepository = tableRepository;
        this.menuItemRepository = menuItemRepository;
        this.itemPresentationRepository = itemPresentationRepository;
        this.userRepository = userRepository;
        this.deliveryService = deliveryService;
        this.entityManager = entityManager;
        this.publisher = publisher;
    }

    public OrderResponse createOrder(CreateOrderRequest request) {
        log.info("Starting createOrder process...");
        
        // Validar que el cliente existe
        log.debug("Validating client with ID: {}", request.getClientId());
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + request.getClientId()));

        // Validar que el usuario existe
        log.debug("Validating user with ID: {}", request.getUserId());
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

        // Validar que la mesa existe (solo para pedidos en establecimiento)
        RestaurantTable table = null;
        if (request.getTableId() != null) {
            log.debug("Validating table with ID: {}", request.getTableId());
            table = tableRepository.findById(request.getTableId())
                    .orElseThrow(() -> new RuntimeException("Table not found with id: " + request.getTableId()));
        }

        // Validar que hay items en el pedido
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Order must have at least one item");
        }

        // Pre-fetch all menu items in a single query to avoid N+1
        List<Long> menuItemIds = request.getItems().stream()
                .map(OrderItemRequest::getMenuItemId)
                .collect(Collectors.toList());
        Map<Long, MenuItem> menuItemMap = menuItemRepository.findAllById(menuItemIds).stream()
                .collect(Collectors.toMap(MenuItem::getId, m -> m));

        // Validate all menu items exist and are available, then calculate total
        float totalAmount = 0f;
        for (OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem = menuItemMap.get(itemRequest.getMenuItemId());
            if (menuItem == null) {
                throw new RuntimeException("Menu item not found with id: " + itemRequest.getMenuItemId());
            }
            if (!menuItem.getAvailable()) {
                throw new RuntimeException("Menu item is not available: " + menuItem.getName());
            }
            float unitPrice = getUnitPrice(menuItem, itemRequest.getPresentationId());
            totalAmount += unitPrice * itemRequest.getQuantity();
        }

        // Crear la orden SIN items primero
        Order order = new Order();
        order.setClient(client);
        order.setUser(user);
        order.setTable(table);
        order.setOrderStatus(Order.OrderStatus.PENDIENTE);
        order.setOrderType(request.getOrderType() != null ? request.getOrderType() : "ESTABLECIMIENTO");
        order.setNotes(request.getNotes());
        order.setTotalAmount(totalAmount);

        // Guardar la orden para generar el ID
        Order savedOrder = orderRepository.save(order);
        
        // Flush para forzar el INSERT y generar el ID inmediatamente
        entityManager.flush();
        
        // Ahora agregar items con el Order ya persistido (tiene ID) — reuse cached menu items
        for (OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem = menuItemMap.get(itemRequest.getMenuItemId());

            float unitPrice = getUnitPrice(menuItem, itemRequest.getPresentationId());

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(unitPrice);
            orderItem.setSpecialInstructions(itemRequest.getSpecialInstructions());

            // Presentación
            if (itemRequest.getPresentationId() != null) {
                orderItem.setPresentationId(itemRequest.getPresentationId());
                itemPresentationRepository.findById(itemRequest.getPresentationId())
                        .ifPresent(p -> orderItem.setPresentationName(p.getName()));
            }

            savedOrder.addItem(orderItem);
        }

        // No es necesario save() nuevamente - los items se persisten automáticamente
        // por CascadeType.ALL cuando termina la transacción
        
        // Si el pedido es de tipo DOMICILIO, crear automáticamente el registro en deliveries
        if ("DOMICILIO".equals(savedOrder.getOrderType())) {
            log.info("Order type is DOMICILIO, creating delivery record...");
            try {
                createDeliveryFromOrder(savedOrder);
                log.info("Delivery record created successfully for order ID: {}", savedOrder.getId());
            } catch (Exception e) {
                log.error("Error creating delivery for order ID {}: {}", savedOrder.getId(), e.getMessage(), e);
                throw new RuntimeException("Error creating delivery: " + e.getMessage());
            }
        }
        
        log.info("Order created successfully with ID: {}", savedOrder.getId());
        OrderResponse response = mapToResponse(savedOrder);
        publisher.publishEvent(new OrderCreatedEvent(this, response));
        return response;
    }
    
    private void createDeliveryFromOrder(Order order) {
        log.debug("Creating delivery from order ID: {}", order.getId());
        
        CreateDeliveryRequest deliveryRequest = new CreateDeliveryRequest();
        deliveryRequest.setOrderId(order.getId());
        
        deliveryService.createDelivery(deliveryRequest);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        // Solo retornar pedidos de tipo ESTABLECIMIENTO para el módulo Orders
        return orderRepository.findByOrderType("ESTABLECIMIENTO").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrdersForPayments() {
        // Retornar TODAS las órdenes (ESTABLECIMIENTO y DOMICILIO) para el módulo de pagos
        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByClient(Long clientId) {
        return orderRepository.findByClientId(clientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByTable(Long tableId) {
        return orderRepository.findByTableId(tableId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        return mapToResponse(order);
    }

    public OrderResponse updateOrder(Long id, UpdateOrderRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        // Actualizar el estado si se proporciona
        if (request.getStatus() != null) {
            order.setOrderStatus(request.getStatus());
        }

        // Actualizar notas si se proporcionan
        if (request.getNotes() != null) {
            order.setNotes(request.getNotes());
        }

        // Actualizar items si se proporcionan
        if (request.getItems() != null) {
            // Limpiar items existentes
            order.getItems().clear();
            
            // Flush para eliminar items en la BD
            entityManager.flush();

            // Recalcular el total
            float totalAmount = 0f;

            // Pre-fetch all menu items in a single query to avoid N+1
            List<Long> menuItemIds = request.getItems().stream()
                    .map(OrderItemRequest::getMenuItemId)
                    .collect(Collectors.toList());
            Map<Long, MenuItem> menuItemMap = menuItemRepository.findAllById(menuItemIds).stream()
                    .collect(Collectors.toMap(MenuItem::getId, m -> m));

            // Agregar nuevos items usando el mapa pre-cargado
            for (OrderItemRequest itemRequest : request.getItems()) {
                MenuItem menuItem = menuItemMap.get(itemRequest.getMenuItemId());
                if (menuItem == null) {
                    throw new RuntimeException("Menu item not found with id: " + itemRequest.getMenuItemId());
                }

                float unitPrice = getUnitPrice(menuItem, itemRequest.getPresentationId());

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order); // order ya existe y tiene ID
                orderItem.setMenuItem(menuItem);
                orderItem.setQuantity(itemRequest.getQuantity());
                orderItem.setUnitPrice(unitPrice);
                orderItem.setSpecialInstructions(itemRequest.getSpecialInstructions());

                // Presentación
                if (itemRequest.getPresentationId() != null) {
                    orderItem.setPresentationId(itemRequest.getPresentationId());
                    itemPresentationRepository.findById(itemRequest.getPresentationId())
                            .ifPresent(p -> orderItem.setPresentationName(p.getName()));
                }

                // Calcular subtotal del item
                float itemSubtotal = unitPrice * itemRequest.getQuantity();
                totalAmount += itemSubtotal;

                order.addItem(orderItem);
            }
            
            // Actualizar el total de la orden
            order.setTotalAmount(totalAmount);
        }

        // No es necesario save() explícito - @Transactional lo maneja
        OrderResponse response = mapToResponse(order);
        publisher.publishEvent(new OrderUpdatedEvent(this, response));
        return response;
    }

    public OrderResponse updateOrderStatus(Long id, Order.OrderStatus status) {
        log.info("Updating order status for ID: {} to: {}", id, status);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        String oldStatus = order.getOrderStatus().name();
        order.setOrderStatus(status);
        Order savedOrder = orderRepository.save(order);
        OrderResponse response = mapToResponse(savedOrder);
        publisher.publishEvent(new OrderStatusChangedEvent(this, id, oldStatus, status.name(), response));
        log.info("Order {} status updated successfully to {}", id, status);
        return response;
    }

    /**
     * Overload that accepts a raw status string, validates and parses it to OrderStatus enum.
     */
    public OrderResponse updateOrderStatus(Long id, String statusString) {
        if (statusString == null || statusString.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }

        String statusUpper = statusString.toUpperCase().trim();
        Order.OrderStatus orderStatus;
        try {
            orderStatus = Order.OrderStatus.valueOf(statusUpper);
        } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException(
                    "Invalid status value: " + statusString + ". Valid values: PENDIENTE, SERVIDO");
        }

        return updateOrderStatus(id, orderStatus);
    }

    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        orderRepository.delete(order);
        publisher.publishEvent(new OrderDeletedEvent(this, id));
    }

    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setClientId(order.getClient().getId());
        response.setClientName(order.getClient().getName());
        response.setClientPhone(order.getClient().getPhone());
        response.setClientAddress(order.getClient().getAddress());
        if (order.getTable() != null) {
            response.setTableId(order.getTable().getId());
            response.setTableNumber(order.getTable().getTableNumber());
        }
        response.setStatus(order.getOrderStatus());
        response.setOrderType(order.getOrderType()); // Agregar tipo de pedido
        response.setTotal(order.getTotalAmount()); // Agregar el total
        response.setNotes(order.getNotes());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        if (order.getUser() != null && order.getUser().getEmployee() != null) {
            String firstName = order.getUser().getEmployee().getFirstName();
            String lastName = order.getUser().getEmployee().getLastName();
            String waiterName = String.format("%s %s", firstName != null ? firstName : "", lastName != null ? lastName : "").trim();
            response.setWaiterName(waiterName.isBlank() ? null : waiterName);
        }

        // Mapear items
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::mapItemToResponse)
                .collect(Collectors.toList());
        response.setItems(items);

        return response;
    }

    private OrderItemResponse mapItemToResponse(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(item.getId());
        response.setMenuItemId(item.getMenuItem().getId());
        response.setMenuItemName(item.getMenuItem().getName());
        response.setMenuItemPrice(BigDecimal.valueOf(item.getUnitPrice()));
        response.setQuantity(item.getQuantity());
        response.setSpecialInstructions(item.getSpecialInstructions());
        response.setPresentationName(item.getPresentationName());
        return response;
    }

    /**
     * Obtiene el precio unitario: si hay presentationId usa el precio
     * de la presentación, si no usa el precio base del MenuItem.
     */
    private float getUnitPrice(MenuItem menuItem, Long presentationId) {
        if (presentationId != null) {
            return itemPresentationRepository.findById(presentationId)
                    .map(ItemPresentation::getPrice)
                    .orElse(menuItem.getPrice());
        }
        return menuItem.getPrice();
    }
}
