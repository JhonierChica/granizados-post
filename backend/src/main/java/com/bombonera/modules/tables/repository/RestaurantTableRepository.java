package com.bombonera.modules.tables.repository;

import com.bombonera.modules.tables.model.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.Optional;


public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
    
    Optional<RestaurantTable> findByTableNumber(Integer tableNumber);
    
    List<RestaurantTable> findByStatus(RestaurantTable.TableStatus status);
    
    List<RestaurantTable> findByIsActiveTrue();
    
    List<RestaurantTable> findByStatusAndIsActiveTrue(RestaurantTable.TableStatus status);
}
