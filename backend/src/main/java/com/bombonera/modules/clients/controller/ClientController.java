package com.bombonera.modules.clients.controller;

import com.bombonera.modules.clients.dto.ClientResponse;
import com.bombonera.modules.clients.dto.CreateClientRequest;
import com.bombonera.modules.clients.dto.UpdateClientRequest;
import com.bombonera.modules.clients.service.ClientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@PreAuthorize("hasAnyRole('ADMIN', 'WAITER', 'CASHIER')")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @PostMapping
    public ResponseEntity<ClientResponse> createClient(@RequestBody CreateClientRequest request) {
        ClientResponse response = clientService.createClient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ClientResponse>> getAllClients(
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(required = false) Boolean frequentOnly,
            @RequestParam(required = false) String search) {
        
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(clientService.searchClientsByName(search));
        }
        
        if (frequentOnly != null && frequentOnly) {
            return ResponseEntity.ok(clientService.getFrequentClients());
        }
        
        List<ClientResponse> clients = activeOnly != null && activeOnly
                ? clientService.getActiveClients()
                : clientService.getAllClients();
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientResponse> getClientById(@PathVariable Long id) {
        try {
            ClientResponse client = clientService.getClientById(id);
            return ResponseEntity.ok(client);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/identification/{identificationNumber}")
    public ResponseEntity<ClientResponse> getClientByIdentificationNumber(
            @PathVariable String identificationNumber) {
        try {
            ClientResponse client = clientService.getClientByIdentificationNumber(identificationNumber);
            return ResponseEntity.ok(client);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientResponse> updateClient(
            @PathVariable Long id,
            @RequestBody UpdateClientRequest request) {
        try {
            ClientResponse response = clientService.updateClient(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            throw new RuntimeException("Error updating client: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        try {
            clientService.deleteClient(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
