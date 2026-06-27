package com.bombonera.modules.menu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkMenuItemsRequest {
    private List<MenuItemEntry> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuItemEntry {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private Long categoryId;
        private Boolean available;
        private List<ItemPresentationEntry> presentations;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemPresentationEntry {
        private Long id;
        private String name;
        private BigDecimal price;
        private Boolean available;
    }
}
