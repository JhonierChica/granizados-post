package com.bombonera.modules.payments.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentRequest {
    private Long orderId;
    private Long paymentMethodId;
    private BigDecimal amount;
    private BigDecimal deliveryFee; // Valor que gana el domiciliario
}
