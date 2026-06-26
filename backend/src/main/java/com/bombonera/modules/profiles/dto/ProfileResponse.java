package com.bombonera.modules.profiles.dto;

import com.bombonera.modules.permissions.dto.PermissionResponse;
import com.bombonera.modules.profiles.model.Profile;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Set<PermissionResponse> permissions;
    private Boolean active;

    /**
     * Factory method to map a Profile entity to its DTO representation.
     * Centralizes the mapping logic to avoid duplication across services.
     *
     * Note: Profile.code is @Transient and always null from the DB.
     * We use profile.getName() as the code value because the frontend
     * relies on profile.code for role-based routing (e.g. "ADMIN", "MESERO").
     */
    public static ProfileResponse fromEntity(Profile profile) {
        if (profile == null) {
            return null;
        }
        Set<PermissionResponse> permissionResponses = profile.getPermissions().stream()
                .map(p -> new PermissionResponse(
                        p.getId(),
                        p.getCode(),
                        p.getName(),
                        p.getDescription(),
                        p.getModule(),
                        p.getActive()
                ))
                .collect(Collectors.toSet());

        return new ProfileResponse(
                profile.getId(),
                profile.getName(), // getName() as code — code is @Transient and always null
                profile.getName(),
                profile.getDescription(),
                permissionResponses,
                profile.getActive()
        );
    }
}
