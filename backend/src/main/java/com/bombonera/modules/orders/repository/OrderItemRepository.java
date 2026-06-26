package com.bombonera.modules.orders.repository;

import com.bombonera.modules.orders.model.OrderItem;
import com.bombonera.modules.orders.model.OrderItemId;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;


public interface OrderItemRepository extends JpaRepository<OrderItem, OrderItemId> {
    
    List<OrderItem> findByOrderId(Long orderId);
}
