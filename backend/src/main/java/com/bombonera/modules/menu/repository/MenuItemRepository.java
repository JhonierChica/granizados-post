package com.bombonera.modules.menu.repository;

import com.bombonera.modules.menu.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.Optional;


public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    
    Optional<MenuItem> findByName(String name);
    
    List<MenuItem> findByAvailableTrue();
    
    List<MenuItem> findByCategoryId(Long categoryId);
    
    List<MenuItem> findByCategoryIdAndAvailableTrue(Long categoryId);
    
    List<MenuItem> findByIsVegetarianTrue();
    
    List<MenuItem> findByIsVeganTrue();
    
    List<MenuItem> findByIsGlutenFreeTrue();
}
