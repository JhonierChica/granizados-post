package com.bombonera.modules.clients.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateClientRequest {
    private String name;
    private String phone;
    private String email;
    private String identificationNumber;
    private String address;
    private String notes;
}
