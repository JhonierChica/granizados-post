package com.bombonera.modules.paymentmethods.service;

import com.bombonera.modules.paymentmethods.dto.CreatePaymentMethodRequest;
import com.bombonera.modules.paymentmethods.dto.PaymentMethodResponse;
import com.bombonera.modules.paymentmethods.dto.UpdatePaymentMethodRequest;
import com.bombonera.modules.paymentmethods.model.PaymentMethod;
import com.bombonera.modules.paymentmethods.repository.PaymentMethodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;

    public PaymentMethodService(PaymentMethodRepository paymentMethodRepository) {
        this.paymentMethodRepository = paymentMethodRepository;
    }

    public PaymentMethodResponse createPaymentMethod(CreatePaymentMethodRequest request) {
        // Validar que el nombre no exista
        if (paymentMethodRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Payment method with name already exists: " + request.getName());
        }

        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setName(request.getName());
        paymentMethod.setIsActive(true);

        PaymentMethod savedPaymentMethod = paymentMethodRepository.save(paymentMethod);
        return mapToResponse(savedPaymentMethod);
    }

    @Transactional(readOnly = true)
    public List<PaymentMethodResponse> getAllPaymentMethods() {
        return paymentMethodRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentMethodResponse> getActivePaymentMethods() {
        return paymentMethodRepository.findByStatus("A").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentMethodResponse getPaymentMethodById(Long id) {
        PaymentMethod paymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment method not found with id: " + id));
        return mapToResponse(paymentMethod);
    }

    public PaymentMethodResponse updatePaymentMethod(Long id, UpdatePaymentMethodRequest request) {
        PaymentMethod paymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment method not found with id: " + id));

        if (request.getName() != null && !request.getName().equals(paymentMethod.getName())) {
            if (paymentMethodRepository.findByName(request.getName()).isPresent()) {
                throw new RuntimeException("Payment method with name already exists: " + request.getName());
            }
            paymentMethod.setName(request.getName());
        }

        if (request.getIsActive() != null) {
            paymentMethod.setIsActive(request.getIsActive());
        }

        PaymentMethod updatedPaymentMethod = paymentMethodRepository.save(paymentMethod);
        return mapToResponse(updatedPaymentMethod);
    }

    public void deletePaymentMethod(Long id) {
        PaymentMethod paymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment method not found with id: " + id));
        paymentMethodRepository.delete(paymentMethod);
    }

    public PaymentMethodResponse togglePaymentMethodStatus(Long id) {
        PaymentMethod paymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment method not found with id: " + id));
        
        paymentMethod.setIsActive(!paymentMethod.getIsActive());
        PaymentMethod updatedPaymentMethod = paymentMethodRepository.save(paymentMethod);
        return mapToResponse(updatedPaymentMethod);
    }

    private PaymentMethodResponse mapToResponse(PaymentMethod paymentMethod) {
        PaymentMethodResponse response = new PaymentMethodResponse();
        response.setId(paymentMethod.getId());
        response.setName(paymentMethod.getName());
        response.setIsActive(paymentMethod.getIsActive());
        return response;
    }
}
