package com.bombonera.modules.positions.service;

import com.bombonera.modules.employees.repository.EmployeeRepository;
import com.bombonera.modules.positions.dto.CreatePositionRequest;
import com.bombonera.modules.positions.dto.PositionResponse;
import com.bombonera.modules.positions.dto.UpdatePositionRequest;
import com.bombonera.modules.positions.model.Position;
import com.bombonera.modules.positions.repository.PositionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PositionService {

    private final PositionRepository positionRepository;
    private final EmployeeRepository employeeRepository;

    public PositionService(PositionRepository positionRepository,
                          EmployeeRepository employeeRepository) {
        this.positionRepository = positionRepository;
        this.employeeRepository = employeeRepository;
    }

    public PositionResponse createPosition(CreatePositionRequest request) {
        // Generar código automáticamente si no se proporciona
        String code = request.getCode();
        if (code == null || code.trim().isEmpty()) {
            code = generatePositionCode(request.getName());
        } else {
            code = code.trim().toUpperCase();
        }
        
        // Verificar si el código ya existe
        if (positionRepository.existsByCode(code)) {
            throw new RuntimeException("Ya existe un cargo con el código: " + code);
        }

        Position position = new Position();
        position.setCode(code);
        position.setName(request.getName());
        position.setDescription(request.getDescription());
        position.setDepartment(request.getDepartment());
        position.setBaseSalary(request.getBaseSalary());
        position.setResponsibilities(request.getResponsibilities());
        position.setActive(true);

        Position savedPosition = positionRepository.save(position);
        return mapToResponse(savedPosition);
    }
    
    /**
     * Genera un código único basado en el nombre del cargo
     */
    private String generatePositionCode(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("El nombre del cargo es obligatorio");
        }
        
        // Tomar las primeras letras del nombre
        String baseCode = name.trim()
            .toUpperCase()
            .replaceAll("[^A-Z0-9]", "")
            .substring(0, Math.min(name.length(), 6));
        
        // Si el código base ya existe, agregar un número
        String code = baseCode;
        int counter = 1;
        while (positionRepository.existsByCode(code)) {
            code = baseCode + counter;
            counter++;
        }
        
        return code;
    }

    @Transactional(readOnly = true)
    public List<PositionResponse> getAllPositions() {
        return positionRepository.findAll().stream()
                .sorted(Comparator.comparing(Position::getId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PositionResponse> getActivePositions() {
        return positionRepository.findByActiveTrue().stream()
                .sorted(Comparator.comparing(Position::getId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PositionResponse> getPositionsByDepartment(String department) {
        return positionRepository.findByDepartment(department).stream()
                .sorted(Comparator.comparing(Position::getId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PositionResponse getPositionById(Long id) {
        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Position not found with id: " + id));
        return mapToResponse(position);
    }

    @Transactional(readOnly = true)
    public PositionResponse getPositionByCode(String code) {
        Position position = positionRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Position not found with code: " + code));
        return mapToResponse(position);
    }

    public PositionResponse updatePosition(Long id, UpdatePositionRequest request) {
        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Position not found with id: " + id));

        if (request.getName() != null) {
            position.setName(request.getName());
        }

        if (request.getDescription() != null) {
            position.setDescription(request.getDescription());
        }

        if (request.getDepartment() != null) {
            position.setDepartment(request.getDepartment());
        }

        if (request.getBaseSalary() != null) {
            position.setBaseSalary(request.getBaseSalary());
        }

        if (request.getResponsibilities() != null) {
            position.setResponsibilities(request.getResponsibilities());
        }

        if (request.getActive() != null) {
            position.setActive(request.getActive());
        }

        Position updatedPosition = positionRepository.save(position);
        return mapToResponse(updatedPosition);
    }

    public void deactivatePosition(Long id) {
        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cargo no encontrado con id: " + id));
        
        // Verificar si hay empleados con este cargo
        List<com.bombonera.modules.employees.model.Employee> employees = 
                employeeRepository.findByPositionId(id);
        
        if (!employees.isEmpty()) {
            throw new RuntimeException(
                "No se puede eliminar el cargo '" + position.getName() + 
                "' porque tiene " + employees.size() + 
                " empleado(s) asociado(s). Primero reasigne o elimine los empleados."
            );
        }
        
        // Si no hay empleados, desactivar el cargo
        position.setActive(false);
        positionRepository.save(position);
    }

    private PositionResponse mapToResponse(Position position) {
        return new PositionResponse(
                position.getId(),
                position.getCode(),
                position.getName(),
                position.getDescription(),
                position.getDepartment(),
                position.getBaseSalary(),
                position.getResponsibilities(),
                position.getActive()
        );
    }
}
