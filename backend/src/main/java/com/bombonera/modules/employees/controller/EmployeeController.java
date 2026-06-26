package com.bombonera.modules.employees.controller;

import com.bombonera.modules.employees.dto.CreateEmployeeRequest;
import com.bombonera.modules.employees.dto.EmployeeResponse;
import com.bombonera.modules.employees.dto.UpdateEmployeeRequest;
import com.bombonera.modules.employees.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@PreAuthorize("hasRole('ADMIN')")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping
    public ResponseEntity<EmployeeResponse> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        EmployeeResponse response = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> getAllEmployees(@RequestParam(required = false) Boolean activeOnly) {
        List<EmployeeResponse> employees = activeOnly != null && activeOnly
                ? employeeService.getActiveEmployees()
                : employeeService.getAllEmployees();
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> getEmployeeById(@PathVariable Long id) {
        try {
            EmployeeResponse employee = employeeService.getEmployeeById(id);
            return ResponseEntity.ok(employee);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoint deshabilitado - la relación User->Employee se maneja desde User
    // @GetMapping("/user/{userId}")
    // public ResponseEntity<EmployeeResponse> getEmployeeByUserId(@PathVariable Long userId) {
    //     return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    // }

    @GetMapping("/position/{positionId}")
    public ResponseEntity<List<EmployeeResponse>> getEmployeesByPosition(@PathVariable Long positionId) {
        List<EmployeeResponse> employees = employeeService.getEmployeesByPositionId(positionId);
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/without-user")
    public ResponseEntity<List<EmployeeResponse>> getEmployeesWithoutUser() {
        List<EmployeeResponse> employees = employeeService.getEmployeesWithoutUser();
        return ResponseEntity.ok(employees);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @PathVariable Long id,
            @RequestBody UpdateEmployeeRequest request) {
        EmployeeResponse employee = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(employee);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        try {
            employeeService.deleteEmployee(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateEmployee(@PathVariable Long id) {
        try {
            employeeService.deactivateEmployee(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
