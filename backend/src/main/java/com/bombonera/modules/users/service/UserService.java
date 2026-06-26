package com.bombonera.modules.users.service;

import com.bombonera.modules.employees.model.Employee;
import com.bombonera.modules.employees.repository.EmployeeRepository;
import com.bombonera.modules.profiles.dto.ProfileResponse;
import com.bombonera.modules.profiles.model.Profile;
import com.bombonera.modules.profiles.repository.ProfileRepository;
import com.bombonera.modules.users.dto.CreateUserRequest;
import com.bombonera.modules.users.dto.UpdateUserRequest;
import com.bombonera.modules.users.dto.UserResponse;
import com.bombonera.modules.users.model.User;
import com.bombonera.modules.users.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, 
                      ProfileRepository profileRepository,
                      EmployeeRepository employeeRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse createUser(CreateUserRequest request) {
        // Validar campos obligatorios
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new RuntimeException("Username is required");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }
        if (request.getEmployeeId() == null) {
            throw new RuntimeException("Employee ID is required");
        }
        
        // Limpiar espacios en blanco
        String username = request.getUsername().trim();
        String password = request.getPassword().trim();
        
        // Validar que no exista el username
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        // Validar que el perfil existe
        Profile profile = profileRepository.findById(request.getProfileId())
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + request.getProfileId()));

        // Validar que el empleado existe y no tiene usuario asignado
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + request.getEmployeeId()));
        
        if (employee.getUser() != null) {
            throw new RuntimeException("Employee already has a user assigned");
        }

        // Crear el usuario con el empleado asignado ANTES de guardar
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password)); 
        user.setEmployee(employee); // IMPORTANTE: Asignar empleado antes de guardar
        user.setProfile(profile);
        user.setActive(request.getActive() != null ? request.getActive() : true);

        User savedUser = userRepository.save(user);

        return mapToResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getActiveUsers() {
        return userRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return mapToResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        return mapToResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByProfileId(Long profileId) {
        return userRepository.findByProfileId(profileId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        }

        if (request.getProfileId() != null) {
            Profile profile = profileRepository.findById(request.getProfileId())
                    .orElseThrow(() -> new RuntimeException("Profile not found with id: " + request.getProfileId()));
            user.setProfile(profile);
        }

        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setActive(false);
        userRepository.save(user);
    }

    private UserResponse mapToResponse(User user) {
        ProfileResponse profileResponse = ProfileResponse.fromEntity(user.getProfile());

        // Obtener fullName del empleado asociado
        String fullName = user.getFullName();
        if (user.getEmployee() != null) {
            fullName = user.getEmployee().getFirstName() + " " + user.getEmployee().getLastName();
        }

        // Convertir LocalDate a LocalDateTime para la fecha de registro
        LocalDateTime registrationDateTime = null;
        if (user.getRegistrationDate() != null) {
            registrationDateTime = user.getRegistrationDate().atStartOfDay();
        }

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(fullName)
                .profile(profileResponse)
                .active(user.getActive())
                .createdAt(registrationDateTime)
                .updatedAt(null) // No hay campo de actualización en la BD
                .build();
    }
}
