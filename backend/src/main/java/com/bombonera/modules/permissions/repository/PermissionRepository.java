package com.bombonera.modules.permissions.repository;

import com.bombonera.modules.permissions.model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.Optional;


public interface PermissionRepository extends JpaRepository<Permission, Long> {
    
    Optional<Permission> findByCode(String code);
    
    List<Permission> findByModule(String module);
    
    List<Permission> findByActiveTrue();
    
    boolean existsByCode(String code);
}
