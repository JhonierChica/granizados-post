package com.bombonera.modules.profiles.controller;

import com.bombonera.modules.profiles.dto.CreateProfileRequest;
import com.bombonera.modules.profiles.dto.ProfileResponse;
import com.bombonera.modules.profiles.dto.UpdateProfileRequest;
import com.bombonera.modules.profiles.service.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
@PreAuthorize("hasRole('ADMIN')")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @PostMapping
    public ResponseEntity<ProfileResponse> createProfile(@RequestBody CreateProfileRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(profileService.createProfile(request));
    }

    @GetMapping
    public ResponseEntity<List<ProfileResponse>> getAllProfiles() {
        return ResponseEntity.ok(profileService.getAllProfiles());
    }

    @GetMapping("/active")
    public ResponseEntity<List<ProfileResponse>> getActiveProfiles() {
        return ResponseEntity.ok(profileService.getActiveProfiles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfileResponse> getProfileById(@PathVariable Long id) {
        return ResponseEntity.ok(profileService.getProfileById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ProfileResponse> getProfileByCode(@PathVariable String code) {
        return ResponseEntity.ok(profileService.getProfileByCode(code));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfileResponse> updateProfile(
            @PathVariable Long id,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(id, request));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ProfileResponse> toggleProfileStatus(@PathVariable Long id) {
        return ResponseEntity.ok(profileService.toggleProfileStatus(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(@PathVariable Long id) {
        profileService.deleteProfile(id);
        return ResponseEntity.noContent().build();
    }
}
