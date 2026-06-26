package com.bombonera.modules.payments.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyPaymentSummaryResponse {
    private LocalDate date;
    private BigDecimal totalSales;
    private int totalTransactions;
    private BigDecimal totalCash;
    private BigDecimal totalTransfer;
    private Map<String, BigDecimal> totalsByMethod;
}
