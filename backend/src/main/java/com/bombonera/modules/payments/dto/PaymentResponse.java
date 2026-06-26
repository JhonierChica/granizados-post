package com.bombonera.modules.payments.dto;

import com.bombonera.modules.orders.dto.OrderItemResponse;
import com.bombonera.modules.payments.model.Payment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private Long paymentMethodId;
    private String paymentMethodName;
    private BigDecimal amount;
    private BigDecimal deliveryFee; // Valor que gana el domiciliario
    private Payment.PaymentStatus status;
    private LocalDate paymentDate;
    private List<OrderItemResponse> items;
}
