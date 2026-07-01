package com.bombonera.modules.tables.service;

import com.bombonera.modules.tables.dto.CreateTableRequest;
import com.bombonera.modules.tables.dto.TableResponse;
import com.bombonera.modules.tables.dto.UpdateTableRequest;
import com.bombonera.modules.tables.model.RestaurantTable;
import com.bombonera.modules.tables.repository.RestaurantTableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RestaurantTableService {

    private final RestaurantTableRepository tableRepository;

    public RestaurantTableService(RestaurantTableRepository tableRepository) {
        this.tableRepository = tableRepository;
    }

    public TableResponse createTable(CreateTableRequest request) {
        // Validar que el número de mesa no exista
        if (tableRepository.findByTableNumber(request.getTableNumber()).isPresent()) {
            throw new RuntimeException("Table number already exists: " + request.getTableNumber());
        }

        RestaurantTable table = new RestaurantTable();
        table.setTableNumber(request.getTableNumber());
        table.setCapacity(request.getCapacity());
        table.setLocation(request.getLocation());
        // Usar el status del request, o DISPONIBLE como valor por defecto
        table.setTableStatus(request.getStatus() != null ? request.getStatus() : RestaurantTable.TableStatus.DISPONIBLE);
        table.setIsActive(true);

        RestaurantTable savedTable = tableRepository.save(table);
        return mapToResponse(savedTable);
    }

    @Transactional(readOnly = true)
    public List<TableResponse> getAllTables() {
        return tableRepository.findAll().stream()
                .sorted(Comparator.comparing(RestaurantTable::getId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TableResponse> getActiveTables() {
        return tableRepository.findByIsActiveTrue().stream()
                .sorted(Comparator.comparing(RestaurantTable::getId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TableResponse> getTablesByStatus(RestaurantTable.TableStatus status) {
        return tableRepository.findByStatusAndIsActiveTrue(status).stream()
                .sorted(Comparator.comparing(RestaurantTable::getId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TableResponse getTableById(Long id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + id));
        return mapToResponse(table);
    }

    @Transactional(readOnly = true)
    public TableResponse getTableByNumber(Integer tableNumber) {
        RestaurantTable table = tableRepository.findByTableNumber(tableNumber)
                .orElseThrow(() -> new RuntimeException("Table not found with number: " + tableNumber));
        return mapToResponse(table);
    }

    public TableResponse updateTable(Long id, UpdateTableRequest request) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + id));

        if (request.getTableNumber() != null && !request.getTableNumber().equals(table.getTableNumber())) {
            if (tableRepository.findByTableNumber(request.getTableNumber()).isPresent()) {
                throw new RuntimeException("Table number already exists: " + request.getTableNumber());
            }
            table.setTableNumber(request.getTableNumber());
        }

        if (request.getCapacity() != null) {
            table.setCapacity(request.getCapacity());
        }

        if (request.getLocation() != null) {
            table.setLocation(request.getLocation());
        }

        if (request.getStatus() != null) {
            table.setTableStatus(request.getStatus());
        }

        if (request.getIsActive() != null) {
            table.setIsActive(request.getIsActive());
        }

        RestaurantTable updatedTable = tableRepository.save(table);
        return mapToResponse(updatedTable);
    }

    public void deleteTable(Long id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + id));
        tableRepository.delete(table);
    }

    private TableResponse mapToResponse(RestaurantTable table) {
        TableResponse response = new TableResponse();
        response.setId(table.getId());
        response.setTableNumber(table.getTableNumber());
        response.setCapacity(table.getCapacity());
        response.setStatus(table.getTableStatus());
        response.setLocation(table.getLocation());
        response.setIsActive(table.getIsActive());
        response.setCreatedAt(table.getCreatedAt());
        response.setUpdatedAt(table.getUpdatedAt());
        return response;
    }
}
