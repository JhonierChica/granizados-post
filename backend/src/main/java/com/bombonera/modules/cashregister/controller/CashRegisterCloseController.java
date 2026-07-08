package com.bombonera.modules.cashregister.controller;

import com.bombonera.modules.cashregister.dto.CashRegisterCloseResponse;
import com.bombonera.modules.cashregister.dto.CreateCashRegisterCloseRequest;
import com.bombonera.modules.cashregister.service.CashRegisterCloseService;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cash-register-closes")
@PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
public class CashRegisterCloseController {

    private final CashRegisterCloseService cashRegisterCloseService;

    public CashRegisterCloseController(CashRegisterCloseService cashRegisterCloseService) {
        this.cashRegisterCloseService = cashRegisterCloseService;
    }

    @PostMapping
    public ResponseEntity<CashRegisterCloseResponse> createCashRegisterClose(
            @RequestBody CreateCashRegisterCloseRequest request) {
        try {
            CashRegisterCloseResponse response = cashRegisterCloseService.createCashRegisterClose(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/daily-close")
    public ResponseEntity<?> createDailyCashClose(@RequestBody Map<String, String> request) {
        try {
            String closedBy = request.getOrDefault("closedBy", "Sistema");
            CashRegisterCloseResponse response = cashRegisterCloseService.createDailyCashClose(closedBy);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<Page<CashRegisterCloseResponse>> getAllCloses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<CashRegisterCloseResponse> closes = cashRegisterCloseService.getAllCloses(page, size);
        return ResponseEntity.ok(closes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CashRegisterCloseResponse> getCloseById(@PathVariable Long id) {
        try {
            CashRegisterCloseResponse close = cashRegisterCloseService.getCloseById(id);
            return ResponseEntity.ok(close);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/last")
    public ResponseEntity<CashRegisterCloseResponse> getLastClose() {
        try {
            CashRegisterCloseResponse close = cashRegisterCloseService.getLastClose();
            return ResponseEntity.ok(close);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<CashRegisterCloseResponse>> getClosesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<CashRegisterCloseResponse> closes = cashRegisterCloseService.getClosesByDateRange(startDate, endDate);
        return ResponseEntity.ok(closes);
    }

    @GetMapping("/user/{closedBy}")
    public ResponseEntity<List<CashRegisterCloseResponse>> getClosesByUser(@PathVariable String closedBy) {
        List<CashRegisterCloseResponse> closes = cashRegisterCloseService.getClosesByUser(closedBy);
        return ResponseEntity.ok(closes);
    }

    @GetMapping("/filtered")
    public ResponseEntity<Page<CashRegisterCloseResponse>> getFilteredCloses(
            @RequestParam String filterType,
            @RequestParam(required = false) String selectedDate,
            @RequestParam(required = false) Integer selectedMonth,
            @RequestParam(required = false) Integer selectedYear,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<CashRegisterCloseResponse> closes = cashRegisterCloseService.getClosesFiltered(
                filterType, selectedDate, selectedMonth, selectedYear, page, size);
        return ResponseEntity.ok(closes);
    }
}
