package com.bombonera.modules.positions.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePositionRequest {
    
    @Size(max = 50, message = "El código no puede exceder 50 caracteres")
    private String code;
    
    @NotBlank(message = "El nombre del cargo es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String name;
    
    @Size(max = 255, message = "La descripción no puede exceder 255 caracteres")
    private String description;
    
    @Size(max = 50, message = "El departamento no puede exceder 50 caracteres")
    private String department;
    
    private BigDecimal baseSalary;
    
    private String responsibilities;
}
