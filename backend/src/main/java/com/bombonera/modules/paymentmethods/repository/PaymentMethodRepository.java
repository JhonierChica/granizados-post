package com.bombonera.modules.paymentmethods.repository;

import com.bombonera.modules.paymentmethods.model.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.Optional;


public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    
    Optional<PaymentMethod> findByName(String name);
    
    // Buscar por estado (A=Activo, I=Inactivo) - campo real en BD
    List<PaymentMethod> findByStatus(String status);
}
