package com.bombonera.modules.profiles.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProfileRequest {
    private String code;
    private String name;
    private String description;
    private Set<Long> permissionIds;
}
