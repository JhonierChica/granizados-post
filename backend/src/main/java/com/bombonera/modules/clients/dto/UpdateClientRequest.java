package com.bombonera.modules.clients.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateClientRequest {
    private String name;
    private String phone;
    private String email;
    private String identificationNumber;
    private String address;
    private Boolean isFrequentCustomer;
    private Integer loyaltyPoints;
    private String notes;
    private Boolean isActive;
}
