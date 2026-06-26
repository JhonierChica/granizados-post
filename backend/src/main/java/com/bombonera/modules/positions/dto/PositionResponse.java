package com.bombonera.modules.positions.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PositionResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String department;
    private BigDecimal baseSalary;
    private String responsibilities;
    private Boolean active;
}
