package com.bombonera.modules.employees.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEmployeeRequest {
    private Long positionId;
    
    @Size(min = 1, max = 20, message = "Los nombres deben tener entre 1 y 20 caracteres")
    private String firstName;
    
    @Size(min = 1, max = 20, message = "Los apellidos deben tener entre 1 y 20 caracteres")
    private String lastName;
    
    @Size(max = 20, message = "El número de documento no puede exceder 20 caracteres")
    private String documentNumber;
    
    @Email(message = "El email debe tener un formato válido")
    @Size(min = 1, max = 30, message = "El email debe tener entre 1 y 30 caracteres")
    private String email;
    
    @Size(max = 10, message = "El teléfono no puede exceder 10 caracteres")
    private String phone;
    
    @Size(max = 30, message = "La dirección no puede exceder 30 caracteres")
    private String address;
    
    private Boolean active;
}
