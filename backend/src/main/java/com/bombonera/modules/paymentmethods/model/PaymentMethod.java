package com.bombonera.modules.paymentmethods.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "`metodoPago`")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "`id_metPag`")
    private Long id;

    @Column(name = "`nombre_metPag`", nullable = false, length = 15)
    private String name;

    @Column(name = "estado", nullable = false, length = 1)
    private String status = "A"; // A=Activo, I=Inactivo

    // Método helper para compatibilidad
    public Boolean getIsActive() {
        return "A".equals(this.status);
    }

    public void setIsActive(Boolean active) {
        this.status = active ? "A" : "I";
    }
}
