package com.bombonera.modules.profiles.repository;

import com.bombonera.modules.profiles.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.Optional;


public interface ProfileRepository extends JpaRepository<Profile, Long> {
    
    Optional<Profile> findByName(String name);
    
    List<Profile> findByStatus(String status);
    
    // Buscar perfiles activos (estado = 'A')
    default List<Profile> findByActiveTrue() {
        return findByStatus("A");
    }
    
    boolean existsByName(String name);
}
