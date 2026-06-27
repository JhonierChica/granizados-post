package com.bombonera.modules.menu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemPresentationResponse {
    private Long id;
    private String name;
    private BigDecimal price;
    private Boolean available;
}
