package com.bombonera.modules.users.model;

import com.bombonera.modules.profiles.model.Profile;
import com.bombonera.modules.employees.model.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * User representa una credencial de acceso al sistema.
 * Es QUIÉN está usando el sistema (username, password, PIN).
 * Se le asigna un Profile que determina QUÉ puede hacer en el sistema.
 */
@Entity
@Table(name = "usuario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_empleado", nullable = false)
    private Employee employee; // Empleado asociado

    @Column(name = "username", nullable = false, length = 20)
    private String username;

    @Column(name = "\"contraseña\"", nullable = false, length = 100)
    private String password;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDate registrationDate = LocalDate.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol", nullable = false)
    private Profile profile; // Perfil de seguridad (rol)

    @Column(name = "estado", nullable = false, length = 1)
    private String status = "A"; // A=Activo, I=Inactivo

    // Campos adicionales no mapeados a BD
    @Transient
    private String fullName;
    
    @Transient
    private UserRole role;
    
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
