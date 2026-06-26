package com.bombonera.modules.cashregister.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CashRegisterCloseResponse {
    
    private Long id;
    private LocalDateTime openingDate;
    private LocalDateTime closingDate;
    private BigDecimal initialAmount;
    private BigDecimal finalAmount;
    private BigDecimal expectedAmount;
    private BigDecimal difference;
    private BigDecimal totalSales;
    private Integer totalTransactions;
    private BigDecimal cashAmount;
    private BigDecimal transferAmount;
    private BigDecimal cardAmount;
    private BigDecimal otherAmount;
    private String closedBy;
    private String notes;
    private LocalDateTime createdAt;
    private List<ItemSalesSummaryDTO> itemSales;
}
