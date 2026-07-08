package com.bombonera.modules.cashregister.repository;

import com.bombonera.modules.cashregister.model.CashRegisterClose;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


public interface CashRegisterCloseRepository extends JpaRepository<CashRegisterClose, Long> {
    
    List<CashRegisterClose> findByClosingDateBetweenOrderByClosingDateDesc(
            LocalDateTime startDate, 
            LocalDateTime endDate
    );
    
    List<CashRegisterClose> findByClosedByOrderByClosingDateDesc(String closedBy);
    
    @Query("SELECT c FROM CashRegisterClose c ORDER BY c.closingDate DESC")
    List<CashRegisterClose> findAllOrderByClosingDateDesc();

    Page<CashRegisterClose> findAllByOrderByClosingDateDesc(Pageable pageable);

    Page<CashRegisterClose> findByClosingDateBetweenOrderByClosingDateDesc(
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );
    
    Optional<CashRegisterClose> findTopByOrderByClosingDateDesc();
}
