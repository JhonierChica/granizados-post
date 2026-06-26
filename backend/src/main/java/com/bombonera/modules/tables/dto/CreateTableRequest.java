package com.bombonera.modules.tables.dto;

import com.bombonera.modules.tables.model.RestaurantTable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTableRequest {
    private Integer tableNumber;
    private Integer capacity;
    private String location;
    private RestaurantTable.TableStatus status;
}
