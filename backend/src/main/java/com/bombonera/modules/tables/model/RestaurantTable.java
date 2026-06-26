package com.bombonera.modules.tables.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "mesa")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mesa")
    private Long id;

    @Column(name = "numero_mesa", nullable = false)
    private Integer tableNumber;

    @Column(name = "capacidad", nullable = false)
    private Integer capacity;

    @Column(name = "estado", nullable = false, length = 1)
    private String status = "D"; // D=Disponible, O=Ocupada, R=Reservada, F=Fuera de servicio

    @Column(name = "ubicacion", length = 30)
    private String location;

    @Transient
    private LocalDateTime createdAt;

    @Transient
    private LocalDateTime updatedAt;

    // Método helper para compatibilidad con TableStatus enum
    public TableStatus getTableStatus() {
        if ("O".equals(status))
            return TableStatus.OCUPADA;
        if ("R".equals(status))
            return TableStatus.RESERVADA;
        if ("F".equals(status))
            return TableStatus.FUERA_DE_SERVICIO;
        return TableStatus.DISPONIBLE;
    }

    public void setTableStatus(TableStatus tableStatus) {
        switch (tableStatus) {
            case OCUPADA:
                this.status = "O";
                break;
            case RESERVADA:
                this.status = "R";
                break;
            case FUERA_DE_SERVICIO:
                this.status = "F";
                break;
            default:
                this.status = "D";
        }
    }

    public Boolean getIsActive() {
        return !"F".equals(this.status);
    }

    public void setIsActive(Boolean active) {
        if (!active)
            this.status = "F";
        else if ("F".equals(this.status))
            this.status = "D";
    }

    public enum TableStatus {
        DISPONIBLE,
        OCUPADA,
        RESERVADA,
        FUERA_DE_SERVICIO
    }
}
