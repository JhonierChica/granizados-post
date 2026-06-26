package com.bombonera.modules.orders.repository;

import com.bombonera.modules.orders.model.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByStatus(Order.OrderStatus status);
    
    List<Order> findByClientId(Long clientId);
    
    List<Order> findByTableId(Long tableId);
    
    List<Order> findByTableIdAndStatus(Long tableId, Order.OrderStatus status);
    
    // Filtrar por tipo de pedido — con JOIN FETCH para evitar N+1
    @EntityGraph(attributePaths = {"items", "items.menuItem", "client", "table", "user", "user.employee"})
    List<Order> findByOrderType(String orderType);
    
    // Combinar filtros — con JOIN FETCH para evitar N+1
    @EntityGraph(attributePaths = {"items", "items.menuItem", "client", "table", "user", "user.employee"})
    List<Order> findByOrderTypeAndStatus(String orderType, Order.OrderStatus status);
}
