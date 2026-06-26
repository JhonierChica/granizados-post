package com.bombonera.modules.clients.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "cliente")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long id;

    @Column(name = "nombre_cliente", nullable = false, length = 50)
    private String firstName; // Nombre

    @Column(name = "apellido_cliente", nullable = false, length = 50)
    private String lastName; // Apellido

    @Column(name = "telefono_cliente", nullable = false, length = 15)
    private String phone;

    @Column(name = "direccion_cliente", length = 100)
    private String address;

    @Column(name = "estado", nullable = false, length = 1)
    private String status = "A"; // A=Activo, I=Inactivo

    @Column(name = "numero_identificacion", unique = true, length = 20)
    private String identificationNumber;
    
    @Column(name = "email", length = 100)
    private String email;
    
    // Campos adicionales no mapeados a BD (para funcionalidad futura)
    @Transient
    private Boolean isFrequentCustomer;
    
    @Transient
    private Integer loyaltyPoints;
    
    @Transient
    private String notes;
    
    @Transient
    private LocalDateTime createdAt;
    
    @Transient
    private LocalDateTime updatedAt;
    
    // Método helper para nombre completo
    public String getName() {
        return firstName + " " + lastName;
    }
    
    public void setName(String fullName) {
        if (fullName != null && fullName.contains(" ")) {
            String[] parts = fullName.split(" ", 2);
            this.firstName = parts[0];
            this.lastName = parts[1];
        } else {
            this.firstName = fullName;
            this.lastName = "";
        }
    }
    
    // Método helper para compatibilidad
    public Boolean getIsActive() {
        return "A".equals(this.status);
    }
    
    public void setIsActive(Boolean active) {
        this.status = active ? "A" : "I";
    }
}
