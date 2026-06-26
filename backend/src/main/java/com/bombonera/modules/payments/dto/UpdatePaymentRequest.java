package com.bombonera.modules.payments.dto;

import com.bombonera.modules.payments.model.Payment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePaymentRequest {
    private BigDecimal amount;
    private Payment.PaymentStatus status;
}
