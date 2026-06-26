package com.bombonera.modules.clients.service;

import com.bombonera.modules.clients.dto.ClientResponse;
import com.bombonera.modules.clients.dto.CreateClientRequest;
import com.bombonera.modules.clients.dto.UpdateClientRequest;
import com.bombonera.modules.clients.model.Client;
import com.bombonera.modules.clients.repository.ClientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClientService {

    private final ClientRepository clientRepository;

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public ClientResponse createClient(CreateClientRequest request) {
        // Validar que el nombre no esté vacío
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("Client name is required");
        }
        
        // Validar que el email no exista si se proporciona
        String trimmedEmail = request.getEmail() != null ? request.getEmail().trim() : null;
        if (trimmedEmail != null && !trimmedEmail.isEmpty()) {
            if (clientRepository.findByEmail(trimmedEmail).isPresent()) {
                throw new RuntimeException("Client with email already exists: " + trimmedEmail);
            }
        }

        // Validar que el identification number no exista si se proporciona
        String trimmedIdentification = request.getIdentificationNumber() != null
                ? request.getIdentificationNumber().trim()
                : null;
        if (trimmedIdentification != null && !trimmedIdentification.isEmpty()) {
            if (clientRepository.findByIdentificationNumber(trimmedIdentification).isPresent()) {
                throw new RuntimeException("Client with identification number already exists: " + trimmedIdentification);
            }
        }

        Client client = new Client();
        client.setName(request.getName().trim());
        client.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        client.setEmail(trimmedEmail != null && !trimmedEmail.isEmpty() ? trimmedEmail : null);
        client.setIdentificationNumber(trimmedIdentification != null && !trimmedIdentification.isEmpty()
            ? trimmedIdentification
            : null);
        client.setAddress(request.getAddress());
        client.setNotes(request.getNotes());
        client.setIsFrequentCustomer(false);
        client.setLoyaltyPoints(0);
        client.setIsActive(true);

        Client savedClient = clientRepository.save(client);
        return mapToResponse(savedClient);
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> getAllClients() {
        return clientRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> getActiveClients() {
        return clientRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> getFrequentClients() {
        return clientRepository.findByIsFrequentCustomerTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClientResponse getClientById(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
        return mapToResponse(client);
    }

    @Transactional(readOnly = true)
    public ClientResponse getClientByIdentificationNumber(String identificationNumber) {
        Client client = clientRepository.findByIdentificationNumber(identificationNumber)
                .orElseThrow(() -> new RuntimeException("Client not found with identification number: " + identificationNumber));
        return mapToResponse(client);
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> searchClientsByName(String name) {
        return clientRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ClientResponse updateClient(Long id, UpdateClientRequest request) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));

        if (request.getName() != null) {
            client.setName(request.getName());
        }

        if (request.getPhone() != null) {
            client.setPhone(request.getPhone());
        }

        if (request.getEmail() != null && !request.getEmail().equals(client.getEmail())) {
            if (clientRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Client with email already exists: " + request.getEmail());
            }
            client.setEmail(request.getEmail());
        }

        if (request.getIdentificationNumber() != null && !request.getIdentificationNumber().equals(client.getIdentificationNumber())) {
            if (clientRepository.findByIdentificationNumber(request.getIdentificationNumber()).isPresent()) {
                throw new RuntimeException("Client with identification number already exists: " + request.getIdentificationNumber());
            }
            client.setIdentificationNumber(request.getIdentificationNumber());
        }

        if (request.getAddress() != null) {
            client.setAddress(request.getAddress());
        }

        if (request.getIsFrequentCustomer() != null) {
            client.setIsFrequentCustomer(request.getIsFrequentCustomer());
        }

        if (request.getLoyaltyPoints() != null) {
            client.setLoyaltyPoints(request.getLoyaltyPoints());
        }

        if (request.getNotes() != null) {
            client.setNotes(request.getNotes());
        }

        if (request.getIsActive() != null) {
            client.setIsActive(request.getIsActive());
        }

        Client updatedClient = clientRepository.save(client);
        return mapToResponse(updatedClient);
    }

    public void deleteClient(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
        clientRepository.delete(client);
    }

    private ClientResponse mapToResponse(Client client) {
        ClientResponse response = new ClientResponse();
        response.setId(client.getId());
        response.setName(client.getName());
        response.setPhone(client.getPhone());
        response.setEmail(client.getEmail());
        response.setIdentificationNumber(client.getIdentificationNumber());
        response.setAddress(client.getAddress());
        response.setIsFrequentCustomer(client.getIsFrequentCustomer());
        response.setLoyaltyPoints(client.getLoyaltyPoints());
        response.setNotes(client.getNotes());
        response.setIsActive(client.getIsActive());
        response.setCreatedAt(client.getCreatedAt());
        response.setUpdatedAt(client.getUpdatedAt());
        return response;
    }
}
