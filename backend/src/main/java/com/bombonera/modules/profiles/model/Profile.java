package com.bombonera.modules.profiles.model;

import com.bombonera.modules.permissions.model.Permission;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Profile representa un rol de seguridad en el sistema con permisos específicos.
 * Define QUÉ puede hacer un usuario en el sistema.
 * Ejemplos: "Mesero", "Cajero", "Gerente", "Administrador"
 */
@Entity
@Table(name = "rol")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    private Long id;

    @Column(name = "nombre_rol", nullable = false, length = 12)
    private String name; // Nombre del rol

    @Column(name = "estado", nullable = false, length = 1)
    private String status = "A"; // A=Activo, I=Inactivo

    // Relación Many-to-Many con Permissions
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "profile_permissions",
        joinColumns = @JoinColumn(name = "profile_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions = new HashSet<>();
    
    // Campos adicionales no mapeados a BD
    @Transient
    private String code;
    
    @Transient
    private String description;
    
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
