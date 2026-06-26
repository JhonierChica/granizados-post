package com.bombonera.modules.users.repository;

import com.bombonera.modules.users.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    boolean existsByUsername(String username);
    
    List<User> findByProfileId(Long profileId);
    
    List<User> findByActiveTrue();
    
    Optional<User> findByEmployeeId(Long employeeId);

    /**
     * Fetch all users whose employee ID is in the given set.
     * Avoids N+1 when mapping multiple employees to their user data.
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.profile p LEFT JOIN FETCH p.permissions WHERE u.employee.id IN :employeeIds")
    List<User> findByEmployeeIdIn(@Param("employeeIds") List<Long> employeeIds);
}
