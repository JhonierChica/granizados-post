package com.bombonera.modules.menu.controller;

import com.bombonera.modules.menu.dto.BulkMenuItemsRequest;
import com.bombonera.modules.menu.dto.CreateMenuItemRequest;
import com.bombonera.modules.menu.dto.MenuItemResponse;
import com.bombonera.modules.menu.dto.UpdateMenuItemRequest;
import com.bombonera.modules.menu.service.MenuItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class MenuItemController {

    private final MenuItemService menuItemService;

    public MenuItemController(MenuItemService menuItemService) {
        this.menuItemService = menuItemService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuItemResponse> createMenuItem(@RequestBody CreateMenuItemRequest request) {
        try {
            MenuItemResponse response = menuItemService.createMenuItem(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MenuItemResponse>> bulkCreateMenuItems(
            @RequestBody BulkMenuItemsRequest request) {
        List<MenuItemResponse> responses = menuItemService.bulkSaveMenuItems(request.getItems());
        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }

    @GetMapping
    public ResponseEntity<List<MenuItemResponse>> getAllMenuItems(
            @RequestParam(required = false) Boolean availableOnly) {
        List<MenuItemResponse> menuItems = availableOnly != null && availableOnly
                ? menuItemService.getAvailableMenuItems()
                : menuItemService.getAllMenuItems();
        return ResponseEntity.ok(menuItems);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItemResponse> getMenuItemById(@PathVariable Long id) {
        try {
            MenuItemResponse menuItem = menuItemService.getMenuItemById(id);
            return ResponseEntity.ok(menuItem);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<MenuItemResponse>> getMenuItemsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(required = false) Boolean availableOnly) {
        List<MenuItemResponse> menuItems = availableOnly != null && availableOnly
                ? menuItemService.getAvailableMenuItemsByCategory(categoryId)
                : menuItemService.getMenuItemsByCategory(categoryId);
        return ResponseEntity.ok(menuItems);
    }

    @GetMapping("/vegetarian")
    public ResponseEntity<List<MenuItemResponse>> getVegetarianMenuItems() {
        List<MenuItemResponse> menuItems = menuItemService.getVegetarianMenuItems();
        return ResponseEntity.ok(menuItems);
    }

    @GetMapping("/vegan")
    public ResponseEntity<List<MenuItemResponse>> getVeganMenuItems() {
        List<MenuItemResponse> menuItems = menuItemService.getVeganMenuItems();
        return ResponseEntity.ok(menuItems);
    }

    @GetMapping("/gluten-free")
    public ResponseEntity<List<MenuItemResponse>> getGlutenFreeMenuItems() {
        List<MenuItemResponse> menuItems = menuItemService.getGlutenFreeMenuItems();
        return ResponseEntity.ok(menuItems);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuItemResponse> updateMenuItem(
            @PathVariable Long id,
            @RequestBody UpdateMenuItemRequest request) {
        try {
            MenuItemResponse menuItem = menuItemService.updateMenuItem(id, request);
            return ResponseEntity.ok(menuItem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        try {
            menuItemService.deleteMenuItem(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/toggle-availability")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> toggleAvailability(@PathVariable Long id) {
        try {
            menuItemService.toggleAvailability(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
