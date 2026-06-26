package com.bombonera.modules.menu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMenuItemRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private Long categoryId;
}
