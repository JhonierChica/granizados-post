package com.bombonera.modules.employees.dto;

import com.bombonera.modules.positions.dto.PositionResponse;
import com.bombonera.modules.profiles.dto.ProfileResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {
    private Long id;
    private Long userId;
    private String username;
    private String firstName;
    private String lastName;
    private String fullName; // Concatenación de firstName + lastName para el frontend
    private String email;
    private ProfileResponse profile; // Perfil de seguridad del usuario (si tiene)
    private PositionResponse position; // Cargo que ocupa
    private String documentNumber;
    private String phone;
    private String address;
    private LocalDate hireDate;
    private BigDecimal salary;
    private String notes;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
