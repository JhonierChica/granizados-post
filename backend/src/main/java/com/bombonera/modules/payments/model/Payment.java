package com.bombonera.modules.payments.model;

import com.bombonera.modules.orders.model.Order;
import com.bombonera.modules.paymentmethods.model.PaymentMethod;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "pago")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "`Id_pedido`", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "`id_metPag`", nullable = false)
    private PaymentMethod paymentMethod;

    @Column(name = "monto", nullable = false)
    private Float amount; // Usar Float porque la BD usa REAL

    @Column(name = "valor_domiciliario", nullable = false)
    private Float deliveryFee = 0f; // Valor que gana el domiciliario

    @Column(name = "fecha_pago", nullable = false)
    private LocalDate paymentDate = LocalDate.now();

    @Column(name = "estado", nullable = false, length = 1)
    private String status = "P"; // P=Pendiente, C=Completado, X=Cancelado, F=Fallido
    
    // Métodos helper para compatibilidad con PaymentStatus enum
    public PaymentStatus getPaymentStatus() {
        if ("C".equals(status)) return PaymentStatus.COMPLETADO;
        if ("X".equals(status)) return PaymentStatus.CANCELADO;
        if ("F".equals(status)) return PaymentStatus.FALLIDO;
        return PaymentStatus.PENDIENTE;
    }
    
    public void setPaymentStatus(PaymentStatus paymentStatus) {
        switch (paymentStatus) {
            case COMPLETADO: this.status = "C"; break;
            case CANCELADO: this.status = "X"; break;
            case FALLIDO: this.status = "F"; break;
            default: this.status = "P";
        }
    }
    
    // Helper para convertir Float a BigDecimal si es necesario
    public BigDecimal getAmountAsBigDecimal() {
        return amount != null ? BigDecimal.valueOf(amount) : BigDecimal.ZERO;
    }
    
    public void setAmountFromBigDecimal(BigDecimal amount) {
        this.amount = amount != null ? amount.floatValue() : 0f;
    }

    public enum PaymentStatus {
        PENDIENTE,
        COMPLETADO,
        CANCELADO,
        FALLIDO
    }
}
