package com.bombonera.modules.menu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateItemPresentationRequest {
    private String name;
    private BigDecimal price;
    private Boolean available;
}
