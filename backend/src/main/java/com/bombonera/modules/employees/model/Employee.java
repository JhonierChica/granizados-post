package com.bombonera.modules.employees.model;

import com.bombonera.modules.positions.model.Position;
import com.bombonera.modules.users.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Employee representa a una persona que trabaja en el restaurante.
 * Vincula la información personal y laboral con:
 * - User (credencial de acceso al sistema)
 * - Position (cargo/puesto laboral que ocupa)
 */
@Entity
@Table(name = "empleado")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empleado")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_cargo", nullable = false)
    private Position position; // Cargo/puesto que ocupa

    @Column(name = "nom_empleado", nullable = false, length = 20)
    private String firstName; // Nombres del empleado

    @Column(name = "ape_empleado", nullable = false, length = 20)
    private String lastName; // Apellidos del empleado

    @Column(name = "numero_documento", length = 20, unique = true)
    private String documentNumber; // Número de documento de identidad

    @Column(name = "correo_empleado", nullable = false, length = 30)
    private String email; // Correo electrónico del empleado

    @Column(name = "tel_empleado", nullable = false, length = 10)
    private String phone; // Teléfono

    @Column(name = "direccion_empleado", nullable = false, length = 30)
    private String address; // Dirección

    @Column(name = "estado", nullable = false, length = 1)
    private String status = "A"; // A=Activo, I=Inactivo

    // Campos no mapeados a BD (solo para lógica de negocio)
    @Transient
    private User user;
    
    @Transient
    private LocalDate hireDate;
    
    @Transient
    private BigDecimal salary;
    
    @Transient
    private String notes;
    
    @Transient
    private LocalDateTime createdAt;
    
    @Transient
    private LocalDateTime updatedAt;
    
    // Método helper para compatibilidad
    public Boolean getActive() {
        return "A".equals(this.status);
    }
    
    public void setActive(Boolean active) {
        this.status = active ? "A" : "I";
    }
}
