package com.bombonera.modules.employees.repository;

import com.bombonera.modules.employees.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import java.util.List;
import java.util.Optional;


public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    Optional<Employee> findByEmail(String email);
    
    Optional<Employee> findByDocumentNumber(String documentNumber);
    
    boolean existsByEmail(String email);
    
    boolean existsByDocumentNumber(String documentNumber);
    
    // Buscar activos usando el campo status
    @Query("SELECT e FROM Employee e WHERE e.status = 'A'")
    List<Employee> findByActiveTrue();
    
    // Buscar por cargo
    List<Employee> findByPositionId(Long positionId);
    
    // Obtener empleados sin usuario asignado
    @Query("SELECT e FROM Employee e WHERE NOT EXISTS (SELECT u FROM User u WHERE u.employee.id = e.id)")
    List<Employee> findByUserIsNull();
}
