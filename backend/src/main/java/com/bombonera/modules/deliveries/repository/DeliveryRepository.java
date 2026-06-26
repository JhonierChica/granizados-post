package com.bombonera.modules.deliveries.repository;

import com.bombonera.modules.deliveries.model.Delivery;
import com.bombonera.modules.deliveries.model.Delivery.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    
    List<Delivery> findByStatusOrderByCreatedAtDesc(DeliveryStatus status);
    
    List<Delivery> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startDate, 
            LocalDateTime endDate
    );
    
    @Query("SELECT d FROM Delivery d ORDER BY d.createdAt DESC")
    List<Delivery> findAllOrderByCreatedAtDesc();
    
    @Query("SELECT d FROM Delivery d WHERE d.status IN :statuses ORDER BY d.createdAt DESC")
    List<Delivery> findByStatusInOrderByCreatedAtDesc(List<DeliveryStatus> statuses);
    
    Optional<Delivery> findByOrderId(Long orderId);
}
