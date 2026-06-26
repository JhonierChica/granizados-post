package com.bombonera.modules.employees.service;

import com.bombonera.modules.employees.dto.CreateEmployeeRequest;
import com.bombonera.modules.employees.dto.EmployeeResponse;
import com.bombonera.modules.employees.dto.UpdateEmployeeRequest;
import com.bombonera.modules.employees.model.Employee;
import com.bombonera.modules.employees.repository.EmployeeRepository;
import com.bombonera.modules.positions.dto.PositionResponse;
import com.bombonera.modules.positions.model.Position;
import com.bombonera.modules.positions.repository.PositionRepository;
import com.bombonera.modules.profiles.dto.ProfileResponse;
import com.bombonera.modules.users.model.User;
import com.bombonera.modules.users.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeService {

    private static final Logger log = LoggerFactory.getLogger(EmployeeService.class);

    private final EmployeeRepository employeeRepository;
    private final PositionRepository positionRepository;
    private final UserRepository userRepository;
    
    public EmployeeService(EmployeeRepository employeeRepository, 
                          UserRepository userRepository,
                          PositionRepository positionRepository) {
        this.employeeRepository = employeeRepository;
        this.positionRepository = positionRepository;
        this.userRepository = userRepository;
    }

    public EmployeeResponse createEmployee(CreateEmployeeRequest request) {
        log.debug("Creating employee - firstName: {}, lastName: {}, email: {}, positionId: {}",
                request.getFirstName(), request.getLastName(), request.getEmail(), request.getPositionId());
        
        // VALIDACIONES
        
        // 1. Validar email único
        if (request.getEmail() != null && 
            employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado: " + request.getEmail());
        }
        
        // 2. Validar documento único si se proporciona
        if (request.getDocumentNumber() != null && !request.getDocumentNumber().trim().isEmpty() &&
            employeeRepository.existsByDocumentNumber(request.getDocumentNumber())) {
            throw new RuntimeException("El número de documento ya existe: " + request.getDocumentNumber());
        }
        
        // 3. Validar que el cargo existe
        Position position = positionRepository.findById(request.getPositionId())
                .orElseThrow(() -> new RuntimeException("Cargo no encontrado con id: " + request.getPositionId()));
        log.debug("Position found: {}", position.getName());
        
        // CREAR EMPLEADO
        Employee employee = new Employee();
        employee.setPosition(position);
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setDocumentNumber(request.getDocumentNumber());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setAddress(request.getAddress());
        
        // Campos transient (no se guardan en BD)
        employee.setHireDate(LocalDate.now());
        employee.setSalary(position.getBaseSalary());
        employee.setActive(true);

        Employee savedEmployee = employeeRepository.save(employee);
        log.info("Employee created with ID: {}", savedEmployee.getId());
        
        return mapToResponse(savedEmployee);
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();
        return mapToResponseList(employees);
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getActiveEmployees() {
        List<Employee> employees = employeeRepository.findByActiveTrue();
        return mapToResponseList(employees);
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getEmployeesWithoutUser() {
        return employeeRepository.findByUserIsNull().stream()
                .map(emp -> mapToResponse(emp, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        return mapToResponse(employee);
    }

    // Método deshabilitado - la relación User->Employee se maneja desde User
    // @Transactional(readOnly = true)
    // public EmployeeResponse getEmployeeByUserId(Long userId) {
    //     throw new RuntimeException("Método no disponible - usar User para obtener Employee");
    // }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getEmployeesByPositionId(Long positionId) {
        return employeeRepository.findByPositionId(positionId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public EmployeeResponse updateEmployee(Long id, UpdateEmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        if (request.getPositionId() != null) {
            Position position = positionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new RuntimeException("Position not found with id: " + request.getPositionId()));
            employee.setPosition(position);
        }

        if (request.getFirstName() != null) {
            employee.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            employee.setLastName(request.getLastName());
        }

        if (request.getDocumentNumber() != null) {
            // Validar que el documento no esté en uso por otro empleado
            if (employeeRepository.existsByDocumentNumber(request.getDocumentNumber())) {
                Employee existingEmployee = employeeRepository.findByDocumentNumber(request.getDocumentNumber())
                        .orElse(null);
                if (existingEmployee != null && !existingEmployee.getId().equals(id)) {
                    throw new RuntimeException("El número de documento ya existe: " + request.getDocumentNumber());
                }
            }
            employee.setDocumentNumber(request.getDocumentNumber());
        }

        if (request.getEmail() != null) {
            // Validar que el email no esté en uso por otro empleado
            if (employeeRepository.existsByEmail(request.getEmail())) {
                Employee existingEmployee = employeeRepository.findByEmail(request.getEmail())
                        .orElse(null);
                if (existingEmployee != null && !existingEmployee.getId().equals(id)) {
                    throw new RuntimeException("El email ya está registrado: " + request.getEmail());
                }
            }
            employee.setEmail(request.getEmail());
        }

        if (request.getPhone() != null) {
            employee.setPhone(request.getPhone());
        }

        if (request.getAddress() != null) {
            employee.setAddress(request.getAddress());
        }

        if (request.getActive() != null) {
            employee.setActive(request.getActive());
        }

        Employee updatedEmployee = employeeRepository.save(employee);
        return mapToResponse(updatedEmployee);
    }

    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new RuntimeException("Employee not found with id: " + id);
        }
        employeeRepository.deleteById(id);
    }

    public void deactivateEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        employee.setActive(false);
        employeeRepository.save(employee);
    }

    /**
     * Batch-maps a list of employees to responses, loading all associated users in one query
     * to avoid N+1 performance issues.
     */
    private List<EmployeeResponse> mapToResponseList(List<Employee> employees) {
        if (employees.isEmpty()) {
            return List.of();
        }

        List<Long> employeeIds = employees.stream()
                .map(Employee::getId)
                .collect(Collectors.toList());

        Map<Long, User> usersByEmployeeId = userRepository.findByEmployeeIdIn(employeeIds)
                .stream()
                .collect(Collectors.toMap(
                        u -> u.getEmployee().getId(),
                        Function.identity(),
                        (a, b) -> a // in case of duplicates, keep first
                ));

        return employees.stream()
                .map(emp -> mapToResponse(emp, usersByEmployeeId.get(emp.getId())))
                .collect(Collectors.toList());
    }

    /**
     * Maps an employee to its response DTO.
     * When called without a pre-fetched user, falls back to a single DB lookup.
     */
    private EmployeeResponse mapToResponse(Employee employee) {
        var userOptional = userRepository.findByEmployeeId(employee.getId());
        return mapToResponse(employee, userOptional.orElse(null));
    }

    private EmployeeResponse mapToResponse(Employee employee, User user) {
        // Mapear Position
        PositionResponse positionResponse = null;
        if (employee.getPosition() != null) {
            positionResponse = new PositionResponse(
                    employee.getPosition().getId(),
                    employee.getPosition().getCode(),
                    employee.getPosition().getName(),
                    employee.getPosition().getDescription(),
                    employee.getPosition().getDepartment(),
                    employee.getPosition().getBaseSalary(),
                    employee.getPosition().getResponsibilities(),
                    employee.getPosition().getActive()
            );
        }

        // Mapear datos de usuario si existe
        ProfileResponse profileResponse = null;
        Long userId = null;
        String username = null;
        
        if (user != null) {
            userId = user.getId();
            username = user.getUsername();
            profileResponse = ProfileResponse.fromEntity(user.getProfile());
        }

        // Construir nombre completo
        String fullName = employee.getFirstName() + " " + employee.getLastName();

        return EmployeeResponse.builder()
                .id(employee.getId())
                .userId(userId)
                .username(username)
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .fullName(fullName)
                .email(employee.getEmail())
                .profile(profileResponse)
                .position(positionResponse)
                .documentNumber(employee.getDocumentNumber())
                .phone(employee.getPhone())
                .address(employee.getAddress())
                .hireDate(employee.getHireDate())
                .salary(employee.getSalary())
                .notes(employee.getNotes())
                .active(employee.getActive())
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt())
                .build();
    }
}
