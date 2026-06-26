package com.bombonera.modules.tables.dto;

import com.bombonera.modules.tables.model.RestaurantTable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TableResponse {
    private Long id;
    private Integer tableNumber;
    private Integer capacity;
    private RestaurantTable.TableStatus status;
    private String location;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
