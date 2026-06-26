package com.bombonera.modules.auth.service;

import com.bombonera.config.security.JwtService;
import com.bombonera.config.security.RoleMapper;
import com.bombonera.modules.auth.dto.LoginRequest;
import com.bombonera.modules.auth.dto.LoginResponse;
import com.bombonera.modules.profiles.dto.ProfileResponse;
import com.bombonera.modules.users.model.User;
import com.bombonera.modules.users.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt - Username: {}", request.getUsername());
        
        // Validar que se proporcionen credenciales
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            log.warn("Login failed: Username is empty");
            throw new RuntimeException("Username is required");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            log.warn("Login failed: Password is empty");
            throw new RuntimeException("Password is required");
        }
        
        // Limpiar espacios en blanco
        String username = request.getUsername().trim();
        String password = request.getPassword().trim();
        
        log.debug("Searching user: {}", username);
        
        // Buscar usuario por username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("Login failed: User not found - {}", username);
                    return new RuntimeException("Invalid username or password");
                });

        log.debug("User found: ID={}, Active={}", user.getId(), user.getActive());
        
        // Verificar si el usuario está activo
        if (!user.getActive()) {
            log.warn("Login failed: User is deactivated - {}", username);
            throw new RuntimeException("User account is deactivated");
        }

        // Lazy migration: detect plaintext passwords (length < 60) and migrate to BCrypt
        String storedPassword = user.getPassword();
        if (storedPassword.length() < 60) {
            // Legacy plaintext password
            if (!storedPassword.equals(password)) {
                log.warn("Login failed: Invalid password for user - {}", username);
                throw new RuntimeException("Invalid username or password");
            }
            // Migrate: hash and save the plaintext password
            String hashedPassword = passwordEncoder.encode(password);
            user.setPassword(hashedPassword);
            userRepository.save(user);
            log.info("Password migrated to BCrypt for user: {}", username);
        } else {
            // BCrypt-hashed password — use PasswordEncoder.matches()
            if (!passwordEncoder.matches(password, storedPassword)) {
                log.warn("Login failed: Invalid password for user - {}", username);
                throw new RuntimeException("Invalid username or password");
            }
        }

        log.debug("Password verified for user: {}", username);

        // Verificar que tenga perfil
        if (user.getProfile() == null) {
            log.warn("Login failed: User has no profile assigned - {}", username);
            throw new RuntimeException("User has no profile assigned. Contact administrator.");
        }
        
        log.debug("Profile found: {} (Active={}, Permissions={})", 
                user.getProfile().getName(), user.getProfile().getActive(), 
                user.getProfile().getPermissions().size());
        
        // Verificar que el perfil esté activo
        if (!user.getProfile().getActive()) {
            log.warn("Login failed: Profile is deactivated - {}", user.getProfile().getName());
            throw new RuntimeException("Your profile has been deactivated. Contact administrator.");
        }

        // Construir ProfileResponse
        ProfileResponse profileResponse = ProfileResponse.fromEntity(user.getProfile());

        // Map DB profile name to Spring Security role, then strip ROLE_ prefix for JWT storage
        String profileName = user.getProfile().getName();
        String springRole = RoleMapper.toSpringRole(profileName);
        String jwtRole = springRole.replace("ROLE_", "");
        
        // Generate real JWT token
        String token = jwtService.generateToken(user.getId(), user.getUsername(), jwtRole);
        
        log.info("Login successful for user: {} (Role: {})", username, profileName);

        // Retornar información del usuario autenticado
        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .profile(profileResponse)
                .message("Login successful")
                .build();
    }

    @Transactional(readOnly = true)
    public boolean hasPermission(Long userId, String permissionCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.getActive() || user.getProfile() == null) {
            return false;
        }

        return user.getProfile().getPermissions().stream()
                .anyMatch(p -> p.getCode().equals(permissionCode) && p.getActive());
    }

    @Transactional(readOnly = true)
    public boolean hasProfile(Long userId, String... profileCodes) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.getActive() || user.getProfile() == null) {
            return false;
        }

        String userProfileCode = user.getProfile().getName(); // Usar name en lugar de code
        for (String profileCode : profileCodes) {
            if (userProfileCode.equals(profileCode)) {
                return true;
            }
        }
        return false;
    }

    @Transactional(readOnly = true)
    public boolean isAdmin(Long userId) {
        return hasProfile(userId, "ADMIN");
    }

    @Transactional(readOnly = true)
    public String getUserProfileCode(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getProfile() != null ? user.getProfile().getName() : null; // Usar name en lugar de code
    }

    /**
     * Verifies the current JWT token is valid by extracting the userId
     * from the SecurityContext (set by JwtAuthFilter) and returning user details.
     * <p>
     * If the token was invalid or expired, the filter would have already
     * rejected the request with 401 before reaching this method.
     */
    @Transactional(readOnly = true)
    public LoginResponse verifyToken(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getActive()) {
            throw new RuntimeException("User account is deactivated");
        }

        ProfileResponse profileResponse = user.getProfile() != null
                ? ProfileResponse.fromEntity(user.getProfile())
                : null;

        return LoginResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .profile(profileResponse)
                .message("Token is valid")
                .build();
    }
}
