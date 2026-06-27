package com.bombonera.modules.menu.repository;

import com.bombonera.modules.menu.model.ItemPresentation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemPresentationRepository extends JpaRepository<ItemPresentation, Long> {
    List<ItemPresentation> findByMenuItemId(Long menuItemId);
    void deleteByMenuItemId(Long menuItemId);
}
