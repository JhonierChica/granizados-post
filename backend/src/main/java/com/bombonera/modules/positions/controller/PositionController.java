package com.bombonera.modules.positions.controller;

import com.bombonera.modules.positions.dto.CreatePositionRequest;
import com.bombonera.modules.positions.dto.PositionResponse;
import com.bombonera.modules.positions.dto.UpdatePositionRequest;
import com.bombonera.modules.positions.service.PositionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/positions")
@PreAuthorize("hasRole('ADMIN')")
public class PositionController {

    private final PositionService positionService;

    public PositionController(PositionService positionService) {
        this.positionService = positionService;
    }

    @PostMapping
    public ResponseEntity<PositionResponse> createPosition(@Valid @RequestBody CreatePositionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(positionService.createPosition(request));
    }

    @GetMapping
    public ResponseEntity<List<PositionResponse>> getAllPositions() {
        return ResponseEntity.ok(positionService.getAllPositions());
    }

    @GetMapping("/active")
    public ResponseEntity<List<PositionResponse>> getActivePositions() {
        return ResponseEntity.ok(positionService.getActivePositions());
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<PositionResponse>> getPositionsByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(positionService.getPositionsByDepartment(department));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PositionResponse> getPositionById(@PathVariable Long id) {
        return ResponseEntity.ok(positionService.getPositionById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<PositionResponse> getPositionByCode(@PathVariable String code) {
        return ResponseEntity.ok(positionService.getPositionByCode(code));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PositionResponse> updatePosition(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePositionRequest request) {
        return ResponseEntity.ok(positionService.updatePosition(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivatePosition(@PathVariable Long id) {
        positionService.deactivatePosition(id);
        return ResponseEntity.noContent().build();
    }
}
