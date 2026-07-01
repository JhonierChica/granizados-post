package com.bombonera.modules.cashregister.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemSalesSummaryDTO {
    private String name;
    private String categoryName;
    private String presentationName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal total;
}
