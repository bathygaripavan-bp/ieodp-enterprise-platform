package com.company.platform.auth.service;

import com.company.platform.common.exception.UnauthorizedException;
import com.company.platform.common.exception.ValidationException;
import com.company.platform.security.jwt.JwtService;
import com.company.platform.users.domain.RefreshToken;
import com.company.platform.users.domain.Role;
import com.company.platform.users.domain.User;
import com.company.platform.auth.dto.AuthResponse;
import com.company.platform.auth.dto.LoginRequest;
import com.company.platform.auth.dto.RefreshTokenRequest;
import com.company.platform.auth.dto.RegisterRequest;
import com.company.platform.users.repository.RefreshTokenRepository;
import com.company.platform.users.repository.RoleRepository;
import com.company.platform.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    // ---------------------------------------------------------
    // REGISTER NEW USER
    // ---------------------------------------------------------
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ValidationException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already exists");
        }

        // Validate role from DB
        String roleName = request.getRole();
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ValidationException("Invalid role: " + roleName +
                        ". Valid roles are: Admin, Manager, Reviewer, Viewer"));

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(role)
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();

        user = userRepository.save(user);

        log.info("User registered successfully: {}", user.getUsername());
        return generateAuthResponse(user);
    }

    // ---------------------------------------------------------
    // LOGIN USER
    // ---------------------------------------------------------
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for user: {}", request.getUsername());

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            log.warn("Authentication failed for user: {}", request.getUsername());
            throw new UnauthorizedException("Invalid username or password");
        }

        User user = (User) authentication.getPrincipal();

        if (!user.isEnabled()) {
            throw new UnauthorizedException("User account is disabled");
        }

        log.info("User logged in: {}", user.getUsername());
        return generateAuthResponse(user);
    }


    // ---------------------------------------------------------
    // REFRESH TOKEN
    // ---------------------------------------------------------
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {

        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (!refreshToken.isValid()) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token expired or revoked");
        }

        User user = refreshToken.getUser();

        // Revoke old token
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        return generateAuthResponse(user);
    }


    // ---------------------------------------------------------
    // LOGOUT
    // ---------------------------------------------------------
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }


    // ---------------------------------------------------------
    // GENERATE AUTH RESPONSE
    // ---------------------------------------------------------
    private AuthResponse generateAuthResponse(User user) {

        // Normalize role to UPPERCASE
        String normalizedRole = user.getRole().getName().toUpperCase();

        // FIX: JWT token must use uppercase role
        String accessToken = jwtService.generateToken(user, normalizedRole);

        // New refresh token
        String refreshTokenValue = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenValue)
                .user(user)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenValue)
                .tokenType("Bearer")
                .expiresIn(3600L)
                .username(user.getUsername())
                .role(normalizedRole) // FIXED
                .redirectUrl(determineRedirectUrl(normalizedRole)) // FIXED
                .issuedAt(LocalDateTime.now())
                .build();
    }


    // ---------------------------------------------------------
    // ROLE-BASED REDIRECT URL MAPPING
    // ---------------------------------------------------------
    private String determineRedirectUrl(String role) {
        switch (role) {
            case "ADMIN":
                return "/admin-dashboard";

            case "MANAGER":
                return "/manager-dashboard";

            case "REVIEWER":
                return "/reviewer-dashboard";

            case "VIEWER":
                return "/viewer-dashboard";

            default:
                return "/dashboard";
        }
    }
}
