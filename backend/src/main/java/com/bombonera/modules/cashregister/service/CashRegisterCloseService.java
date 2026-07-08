package com.bombonera.modules.cashregister.service;

import com.bombonera.modules.cashregister.dto.CashRegisterCloseResponse;
import com.bombonera.modules.cashregister.dto.CreateCashRegisterCloseRequest;
import com.bombonera.modules.cashregister.model.CashRegisterClose;
import com.bombonera.modules.cashregister.repository.CashRegisterCloseRepository;
import com.bombonera.modules.payments.model.Payment;
import com.bombonera.modules.payments.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.text.Normalizer;
import java.util.stream.Collectors;

import com.bombonera.modules.cashregister.dto.ItemSalesSummaryDTO;
import com.bombonera.modules.orders.model.OrderItem;

@Service
public class CashRegisterCloseService {

    private static final Logger log = LoggerFactory.getLogger(CashRegisterCloseService.class);

    @Value("${app.cash-register.day-start-hour:5}")
    private int dayStartHour;

    private final CashRegisterCloseRepository cashRegisterCloseRepository;
    private final PaymentRepository paymentRepository;

    public CashRegisterCloseService(CashRegisterCloseRepository cashRegisterCloseRepository,
                                     PaymentRepository paymentRepository) {
        this.cashRegisterCloseRepository = cashRegisterCloseRepository;
        this.paymentRepository = paymentRepository;
    }

    /**
     * Resuelve la fecha efectiva del día de negocio según la hora de corte configurada.
     * Si la hora actual es menor a dayStartHour, el cierre pertenece al día calendario anterior.
     *
     * Ejemplo con cutoff=5:
     *   - 04:59 → returns yesterday
     *   - 05:00 → returns today
     *   - 22:00 → returns today
     */
    private LocalDate resolveBusinessDate() {
        LocalDateTime now = LocalDateTime.now();
        if (now.getHour() < dayStartHour) {
            return now.toLocalDate().minusDays(1);
        }
        return now.toLocalDate();
    }

    @Transactional
    public CashRegisterCloseResponse createDailyCashClose(String closedBy) {
        LocalDate today = resolveBusinessDate();
        
        // Verificar si ya existe un cierre para hoy
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);
        List<CashRegisterClose> existingCloses = cashRegisterCloseRepository
                .findByClosingDateBetweenOrderByClosingDateDesc(startOfDay, endOfDay);
        if (!existingCloses.isEmpty()) {
            throw new RuntimeException("Ya existe un cierre de caja para el día de hoy");
        }

        // Obtener pagos del día de negocio
        List<Payment> todayPayments = paymentRepository.findByPaymentDate(today);
        List<Payment> completedPayments = todayPayments.stream()
                .filter(p -> "C".equals(p.getStatus()))
                .collect(Collectors.toList());

        // FR6: Validar que hay al menos un pago completado
        if (completedPayments.isEmpty()) {
            throw new RuntimeException("No hay pagos completados para la fecha de cierre: " + today);
        }

        BigDecimal totalSales = completedPayments.stream()
                .map(Payment::getAmountAsBigDecimal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalTransactions = completedPayments.size();

        // Obtener monto inicial del último cierre
        BigDecimal initialAmount = BigDecimal.ZERO;
        try {
            CashRegisterClose lastClose = cashRegisterCloseRepository
                    .findTopByOrderByClosingDateDesc().orElse(null);
            if (lastClose != null) {
                initialAmount = lastClose.getFinalAmount();
            }
        } catch (Exception e) {
            log.warn("No previous cash register closes found, using initial amount of 0: {}", e.getMessage());
        }

        BigDecimal finalAmount = initialAmount.add(totalSales);
        BigDecimal expectedAmount = initialAmount.add(totalSales);
        BigDecimal difference = finalAmount.subtract(expectedAmount);

        CashRegisterClose close = new CashRegisterClose();
        close.setOpeningDate(startOfDay);
        close.setClosingDate(today.atTime(23, 59, 59));
        close.setInitialAmount(initialAmount);
        close.setFinalAmount(finalAmount);
        close.setExpectedAmount(expectedAmount);
        close.setDifference(difference);
        close.setTotalSales(totalSales);
        close.setTotalTransactions(totalTransactions);
        MethodTotals methodTotals = calculateMethodTotalsFromPayments(completedPayments);
        close.setCashAmount(methodTotals.cashAmount);
        close.setCardAmount(methodTotals.cardAmount);
        close.setOtherAmount(methodTotals.transferAmount.add(methodTotals.otherAmount));
        close.setClosedBy(closedBy);
        close.setNotes("Cierre de caja del día " + today);

        CashRegisterClose savedClose = cashRegisterCloseRepository.save(close);
        return mapToResponse(savedClose);
    }

    @Transactional
    public CashRegisterCloseResponse createCashRegisterClose(CreateCashRegisterCloseRequest request) {
        // Server-authoritative business date resolution
        LocalDate businessDate = resolveBusinessDate();

        // Guard: Evitar cierres duplicados para el mismo día de negocio
        LocalDateTime startOfDay = businessDate.atStartOfDay();
        LocalDateTime endOfDay = businessDate.atTime(LocalTime.MAX);
        List<CashRegisterClose> existingCloses = cashRegisterCloseRepository
                .findByClosingDateBetweenOrderByClosingDateDesc(startOfDay, endOfDay);
        
        if (!existingCloses.isEmpty()) {
            throw new RuntimeException("Ya existe un cierre de caja registrado para el día " + businessDate);
        }

        // Query payments for the business date
        List<Payment> todayPayments = paymentRepository.findByPaymentDate(businessDate);
        List<Payment> completedPayments = todayPayments.stream()
                .filter(p -> "C".equals(p.getStatus()))
                .collect(Collectors.toList());

        // FR6: Validar que hay al menos un pago completado
        if (completedPayments.isEmpty()) {
            throw new RuntimeException("No hay pagos completados para la fecha de cierre: " + businessDate);
        }

        CashRegisterClose close = new CashRegisterClose();
        close.setClosingDate(businessDate.atTime(23, 59, 59));
        
        // Obtener último cierre histórico para el monto inicial
        CashRegisterClose lastClose = cashRegisterCloseRepository.findTopByOrderByClosingDateDesc().orElse(null);
        
        LocalDateTime openingDate = request.getOpeningDate();
        if (openingDate == null) {
            openingDate = (lastClose != null) ? lastClose.getClosingDate() : startOfDay;
        }
        close.setOpeningDate(openingDate);

        BigDecimal initialAmount = request.getInitialAmount();
        if (initialAmount == null || initialAmount.compareTo(BigDecimal.ZERO) == 0) {
            initialAmount = (lastClose != null) ? lastClose.getFinalAmount() : BigDecimal.ZERO;
        }
        close.setInitialAmount(initialAmount);

        // Cálculo de ventas: usar los pagos reales del día de negocio
        BigDecimal totalSales = request.getTotalSales();
        Integer totalTransactions = request.getTotalTransactions();

        if (totalSales == null || totalSales.compareTo(BigDecimal.ZERO) == 0) {
            totalSales = completedPayments.stream()
                    .map(Payment::getAmountAsBigDecimal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            totalTransactions = completedPayments.size();
        }

        close.setTotalSales(totalSales);
        close.setTotalTransactions(totalTransactions);
        
        BigDecimal expectedAmount = initialAmount.add(totalSales);
        close.setExpectedAmount(expectedAmount);
        
        BigDecimal finalAmount = request.getFinalAmount();
        if (finalAmount == null || finalAmount.compareTo(BigDecimal.ZERO) == 0) {
            finalAmount = expectedAmount;
        }
        close.setFinalAmount(finalAmount);
        
        close.setDifference(finalAmount.subtract(expectedAmount));
        MethodTotals methodTotals = calculateMethodTotalsFromPayments(completedPayments);
        close.setCashAmount(methodTotals.cashAmount);
        close.setCardAmount(methodTotals.cardAmount);
        close.setOtherAmount(methodTotals.transferAmount.add(methodTotals.otherAmount));
        
        close.setClosedBy(request.getClosedBy() != null ? request.getClosedBy() : "Sistema");
        close.setNotes(request.getNotes() != null ? request.getNotes() : "Cierre de jornada consolidado");

        CashRegisterClose savedClose = cashRegisterCloseRepository.save(close);
        return mapToResponse(savedClose);
    }

    /**
     * Resolves the effective business date based on the configurable cutoff hour.
     * If the current hour is less than dayStartHour, the close belongs to the
     * previous calendar day. Otherwise, it belongs to today.
     *
     * Example with cutoff=5:
     *   - 04:59 → returns yesterday
     *   - 05:00 → returns today
     *   - 22:00 → returns today
     */
    private LocalDate resolveBusinessDate() {
        LocalDateTime now = LocalDateTime.now();
        if (now.getHour() < dayStartHour) {
            return now.toLocalDate().minusDays(1);
        }
        return now.toLocalDate();
    }

    @Transactional(readOnly = true)
    public Page<CashRegisterCloseResponse> getAllCloses(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CashRegisterClose> closesPage = cashRegisterCloseRepository
                .findAllByOrderByClosingDateDesc(pageable);
        return closesPage.map(this::mapToResponse);
    }

    /**
     * Returns paginated closes filtered by date range derived from filterType.
     *
     * @param filterType   "day", "month", "year", or "all"
     * @param selectedDate ISO date string (yyyy-MM-dd) for "day" filter
     * @param selectedMonth 1-12 for "month" filter
     * @param selectedYear  yyyy for "month" or "year" filters
     * @param page         zero-based page number
     * @param size         page size
     * @return paginated response filtered by the requested date range
     */
    @Transactional(readOnly = true)
    public Page<CashRegisterCloseResponse> getClosesFiltered(
            String filterType,
            String selectedDate,
            Integer selectedMonth,
            Integer selectedYear,
            int page,
            int size) {

        LocalDateTime start;
        LocalDateTime end;

        switch (filterType) {
            case "day":
                if (selectedDate == null || selectedDate.isEmpty()) {
                    return getAllCloses(page, size);
                }
                LocalDate date = LocalDate.parse(selectedDate);
                start = date.atStartOfDay();
                end = date.atTime(LocalTime.MAX);
                break;

            case "month":
                if (selectedMonth == null || selectedYear == null) {
                    return getAllCloses(page, size);
                }
                LocalDate firstOfMonth = LocalDate.of(selectedYear, selectedMonth, 1);
                start = firstOfMonth.atStartOfDay();
                end = firstOfMonth.plusMonths(1).minusDays(1).atTime(LocalTime.MAX);
                break;

            case "year":
                if (selectedYear == null) {
                    return getAllCloses(page, size);
                }
                start = LocalDate.of(selectedYear, 1, 1).atStartOfDay();
                end = LocalDate.of(selectedYear, 12, 31).atTime(LocalTime.MAX);
                break;

            default:
                return getAllCloses(page, size);
        }

        Pageable pageable = PageRequest.of(page, size);
        return cashRegisterCloseRepository
                .findByClosingDateBetweenOrderByClosingDateDesc(start, end, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public CashRegisterCloseResponse getCloseById(Long id) {
        CashRegisterClose close = cashRegisterCloseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cierre de caja no encontrado con id: " + id));
        return mapToResponse(close);
    }

    @Transactional(readOnly = true)
    public List<CashRegisterCloseResponse> getClosesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return cashRegisterCloseRepository.findByClosingDateBetweenOrderByClosingDateDesc(startDate, endDate)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CashRegisterCloseResponse> getClosesByUser(String closedBy) {
        return cashRegisterCloseRepository.findByClosedByOrderByClosingDateDesc(closedBy)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CashRegisterCloseResponse getLastClose() {
        CashRegisterClose close = cashRegisterCloseRepository.findTopByOrderByClosingDateDesc()
                .orElseThrow(() -> new RuntimeException("No se encontraron cierres de caja"));
        return mapToResponse(close);
    }

    private CashRegisterCloseResponse mapToResponse(CashRegisterClose close) {
        CashRegisterCloseResponse response = new CashRegisterCloseResponse();
        response.setId(close.getId());
        response.setOpeningDate(close.getOpeningDate());
        response.setClosingDate(close.getClosingDate());
        response.setInitialAmount(close.getInitialAmount());
        response.setFinalAmount(close.getFinalAmount());
        response.setExpectedAmount(close.getExpectedAmount());
        response.setDifference(close.getDifference());
        response.setTotalSales(close.getTotalSales());
        response.setTotalTransactions(close.getTotalTransactions());
        response.setCashAmount(close.getCashAmount());
        response.setCardAmount(close.getCardAmount());
        response.setOtherAmount(close.getOtherAmount());
        response.setClosedBy(close.getClosedBy());
        response.setNotes(close.getNotes());
        response.setCreatedAt(close.getCreatedAt());

        // Calcular resumen de ventas por item dinámicamente
        if (close.getClosingDate() != null) {
            LocalDate date = close.getClosingDate().toLocalDate();
            List<Payment> payments = paymentRepository.findByPaymentDate(date);
            List<Payment> completedPayments = payments.stream()
                    .filter(p -> "C".equals(p.getStatus()))
                    .collect(Collectors.toList());
            response.setItemSales(calculateItemSalesSummary(completedPayments));

            MethodTotals methodTotals = calculateMethodTotalsFromPayments(completedPayments);
            response.setCashAmount(methodTotals.cashAmount);
            response.setCardAmount(methodTotals.cardAmount);
            response.setOtherAmount(methodTotals.otherAmount);
            response.setTransferAmount(methodTotals.transferAmount);
        }

        return response;
    }

    private List<ItemSalesSummaryDTO> calculateItemSalesSummary(List<Payment> payments) {
        Map<String, ItemSalesSummaryDTO> summaryMap = new HashMap<>();
        Set<Long> processedOrderIds = new HashSet<>(); // Evita contar la misma orden múltiples veces (split payments)

        for (Payment payment : payments) {
            if (payment.getOrder() != null && payment.getOrder().getId() != null) {
                Long orderId = payment.getOrder().getId();
                // Si ya procesamos esta orden por otro pago (split payment), la saltamos
                if (!processedOrderIds.add(orderId)) {
                    continue;
                }
            }
            if (payment.getOrder() != null && payment.getOrder().getItems() != null) {
                for (OrderItem item : payment.getOrder().getItems()) {
                    if (item.getMenuItem() != null && "A".equals(item.getStatus())) {
                        String itemName = item.getMenuItem().getName();
                        String presentationName = item.getPresentationName();
                        String categoryName = item.getMenuItem().getCategory() != null ? 
                                item.getMenuItem().getCategory().getName() : "Sin Categoría";
                        BigDecimal unitPrice = item.getUnitPrice() != null ? 
                                BigDecimal.valueOf(item.getUnitPrice()) : BigDecimal.ZERO;
                        int quantity = item.getQuantity() != null ? item.getQuantity() : 0;

                        // Usar clave compuesta: nombre del item + presentación (si existe)
                        // para separar items con mismo nombre pero distinta presentación
                        String summaryKey = presentationName != null && !presentationName.isBlank()
                                ? itemName + "|" + presentationName
                                : itemName;

                        if (summaryMap.containsKey(summaryKey)) {
                            ItemSalesSummaryDTO summary = summaryMap.get(summaryKey);
                            summary.setQuantity(summary.getQuantity() + quantity);
                            summary.setTotal(summary.getTotal().add(unitPrice.multiply(BigDecimal.valueOf(quantity))));
                        } else {
                            ItemSalesSummaryDTO summary = new ItemSalesSummaryDTO();
                            summary.setName(itemName);
                            summary.setCategoryName(categoryName);
                            summary.setPresentationName(presentationName);
                            summary.setQuantity(quantity);
                            summary.setUnitPrice(unitPrice);
                            summary.setTotal(unitPrice.multiply(BigDecimal.valueOf(quantity)));
                            summaryMap.put(summaryKey, summary);
                        }
                    }
                }
            }
        }

        return new ArrayList<>(summaryMap.values());
    }

    /**
     * Calculates payment method totals in-memory from already-loaded payments.
     * Avoids a separate GROUP BY query — uses the payments already loaded via
     * {@code PaymentRepository.findByPaymentDate()} with {@code @EntityGraph}.
     */
    private MethodTotals calculateMethodTotalsFromPayments(List<Payment> completedPayments) {
        BigDecimal cashAmount = BigDecimal.ZERO;
        BigDecimal transferAmount = BigDecimal.ZERO;
        BigDecimal cardAmount = BigDecimal.ZERO;
        BigDecimal otherAmount = BigDecimal.ZERO;

        for (Payment payment : completedPayments) {
            if (payment.getPaymentMethod() == null) continue;
            String methodName = payment.getPaymentMethod().getName();
            BigDecimal amount = payment.getAmountAsBigDecimal();

            if (isCashMethod(methodName)) {
                cashAmount = cashAmount.add(amount);
            } else if (isTransferMethod(methodName)) {
                transferAmount = transferAmount.add(amount);
            } else if (isCardMethod(methodName)) {
                cardAmount = cardAmount.add(amount);
            } else {
                otherAmount = otherAmount.add(amount);
            }
        }

        return new MethodTotals(cashAmount, transferAmount, cardAmount, otherAmount);
    }

    private boolean isCashMethod(String name) {
        String normalized = normalizeMethodName(name);
        return normalized.contains("EFECTIVO") || normalized.contains("CASH");
    }

    private boolean isTransferMethod(String name) {
        String normalized = normalizeMethodName(name);
        return normalized.contains("TRANSFER") || normalized.contains("TRASFER");
    }

    private boolean isCardMethod(String name) {
        String normalized = normalizeMethodName(name);
        return normalized.contains("TARJETA") || normalized.contains("CARD");
    }

    private String normalizeMethodName(String name) {
        if (name == null) return "";
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return normalized.toUpperCase();
    }

    private static class MethodTotals {
        private final BigDecimal cashAmount;
        private final BigDecimal transferAmount;
        private final BigDecimal cardAmount;
        private final BigDecimal otherAmount;

        private MethodTotals(BigDecimal cashAmount, BigDecimal transferAmount, BigDecimal cardAmount, BigDecimal otherAmount) {
            this.cashAmount = cashAmount;
            this.transferAmount = transferAmount;
            this.cardAmount = cardAmount;
            this.otherAmount = otherAmount;
        }
    }
}
