package com.bombonera.modules.cashregister.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cash_register_closes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CashRegisterClose {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "opening_date", nullable = false)
    private LocalDateTime openingDate;

    @Column(name = "closing_date", nullable = false)
    private LocalDateTime closingDate;

    @Column(name = "initial_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal initialAmount;

    @Column(name = "final_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalAmount;

    @Column(name = "expected_amount", precision = 10, scale = 2)
    private BigDecimal expectedAmount;

    @Column(name = "difference", precision = 10, scale = 2)
    private BigDecimal difference;

    @Column(name = "total_sales", precision = 10, scale = 2)
    private BigDecimal totalSales;

    @Column(name = "total_transactions")
    private Integer totalTransactions;

    @Column(name = "cash_amount", precision = 10, scale = 2)
    private BigDecimal cashAmount;

    @Column(name = "card_amount", precision = 10, scale = 2)
    private BigDecimal cardAmount;

    @Column(name = "other_amount", precision = 10, scale = 2)
    private BigDecimal otherAmount;

    @Column(name = "closed_by", length = 100)
    private String closedBy;

    @Column(length = 1000)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
