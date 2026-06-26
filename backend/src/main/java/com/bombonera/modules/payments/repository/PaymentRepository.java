package com.bombonera.modules.payments.repository;

import com.bombonera.modules.payments.model.Payment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;


public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    List<Payment> findByOrderId(Long orderId);
    
    // Buscar por status usando el valor String de la BD (P, C, X, F)
    List<Payment> findByStatus(String status);
    
    List<Payment> findByPaymentMethodId(Long paymentMethodId);

    List<Payment> findByPaymentDateBetween(LocalDate startDate, LocalDate endDate);

    List<Payment> findByPaymentDate(LocalDate date);

    List<Payment> findByPaymentDateGreaterThanEqual(LocalDate date);

    List<Payment> findByPaymentDateGreaterThan(LocalDate date);

    // Override findAll() con JOIN FETCH para evitar N+1 al mapear payments
    @Override
    @EntityGraph(attributePaths = {"order.items.menuItem", "paymentMethod"})
    List<Payment> findAll();

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentDate = :date AND p.status = :status")
    int countByPaymentDateAndStatus(@Param("date") LocalDate date, @Param("status") String status);

    @Query("SELECT pm.name, SUM(p.amount) FROM Payment p JOIN p.paymentMethod pm WHERE p.paymentDate = :date AND p.status = :status GROUP BY pm.name")
    List<Object[]> sumAmountsByMethodAndDate(@Param("date") LocalDate date, @Param("status") String status);
}
