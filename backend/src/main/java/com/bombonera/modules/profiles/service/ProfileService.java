package com.bombonera.modules.profiles.service;

import com.bombonera.modules.permissions.dto.PermissionResponse;
import com.bombonera.modules.permissions.model.Permission;
import com.bombonera.modules.permissions.repository.PermissionRepository;
import com.bombonera.modules.profiles.dto.CreateProfileRequest;
import com.bombonera.modules.profiles.dto.ProfileResponse;
import com.bombonera.modules.profiles.dto.UpdateProfileRequest;
import com.bombonera.modules.profiles.model.Profile;
import com.bombonera.modules.profiles.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final PermissionRepository permissionRepository;

    public ProfileService(ProfileRepository profileRepository, PermissionRepository permissionRepository) {
        this.profileRepository = profileRepository;
        this.permissionRepository = permissionRepository;
    }

    public ProfileResponse createProfile(CreateProfileRequest request) {
        // Validar que el nombre no esté duplicado
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("Profile name is required");
        }
        
        // Validar longitud del nombre (máximo 12 caracteres según BD)
        if (request.getName().length() > 12) {
            throw new RuntimeException("Profile name must be 12 characters or less");
        }

        Profile profile = new Profile();
        profile.setName(request.getName().toUpperCase()); // Guardar en mayúsculas
        profile.setActive(true);

        // Asignar permisos
        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            Set<Permission> permissions = new HashSet<>(
                permissionRepository.findAllById(request.getPermissionIds())
            );
            profile.setPermissions(permissions);
        }

        Profile savedProfile = profileRepository.save(profile);
        return mapToResponse(savedProfile);
    }

    @Transactional(readOnly = true)
    public List<ProfileResponse> getAllProfiles() {
        return profileRepository.findAll().stream()
                .sorted(Comparator.comparing(Profile::getId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProfileResponse> getActiveProfiles() {
        return profileRepository.findByActiveTrue().stream()
                .sorted(Comparator.comparing(Profile::getId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfileById(Long id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));
        return mapToResponse(profile);
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfileByCode(String code) {
        // Como code no existe en BD, buscar por name
        Profile profile = profileRepository.findByName(code)
                .orElseThrow(() -> new RuntimeException("Profile not found with name: " + code));
        return mapToResponse(profile);
    }

    public ProfileResponse updateProfile(Long id, UpdateProfileRequest request) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));

        if (request.getName() != null) {
            // Validar longitud del nombre (máximo 12 caracteres)
            if (request.getName().length() > 12) {
                throw new RuntimeException("Profile name must be 12 characters or less");
            }
            profile.setName(request.getName().toUpperCase());
        }

        // description no se guarda (es @Transient)

        if (request.getActive() != null) {
            profile.setActive(request.getActive());
        }

        // Actualizar permisos
        if (request.getPermissionIds() != null) {
            Set<Permission> permissions = new HashSet<>(
                permissionRepository.findAllById(request.getPermissionIds())
            );
            profile.setPermissions(permissions);
        }

        Profile updatedProfile = profileRepository.save(profile);
        return mapToResponse(updatedProfile);
    }

    public void deleteProfile(Long id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));
        // Eliminar físicamente de la base de datos
        profileRepository.delete(profile);
    }

    public ProfileResponse toggleProfileStatus(Long id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));
        // Cambiar el estado: si está activo (A) pasar a inactivo (I) y viceversa
        profile.setActive(!profile.getActive());
        Profile updatedProfile = profileRepository.save(profile);
        return mapToResponse(updatedProfile);
    }

    private ProfileResponse mapToResponse(Profile profile) {
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
                profile.getName(), // Usar name como code también
                profile.getName(),
                "", // description vacío (no existe en BD)
                permissionResponses,
                profile.getActive()
        );
    }
}
