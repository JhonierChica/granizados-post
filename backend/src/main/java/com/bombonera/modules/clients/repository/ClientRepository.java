package com.bombonera.modules.clients.repository;

import com.bombonera.modules.clients.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.Optional;


public interface ClientRepository extends JpaRepository<Client, Long> {
    
    Optional<Client> findByIdentificationNumber(String identificationNumber);
    
    Optional<Client> findByEmail(String email);
    
    Optional<Client> findByPhone(String phone);
    
    @Query("SELECT c FROM Client c WHERE c.status = 'A'")
    List<Client> findByIsActiveTrue();
    
    List<Client> findByIsFrequentCustomerTrue();
    
    @Query("SELECT c FROM Client c WHERE LOWER(CONCAT(c.firstName, ' ', c.lastName)) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Client> findByNameContainingIgnoreCase(@Param("name") String name);
}
