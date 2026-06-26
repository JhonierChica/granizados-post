package com.bombonera.modules.users.dto;

import com.bombonera.modules.profiles.dto.ProfileResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String fullName;
    private ProfileResponse profile; // Perfil de seguridad con permisos
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
