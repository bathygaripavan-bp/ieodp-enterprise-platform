package com.company.platform.auth.service;

import com.company.platform.common.exception.UnauthorizedException;
import com.company.platform.common.exception.ValidationException;
import com.company.platform.security.jwt.JwtService;
import com.company.platform.users.domain.Role;
import com.company.platform.users.domain.User;
import com.company.platform.auth.dto.AuthResponse;
import com.company.platform.auth.dto.LoginRequest;
import com.company.platform.auth.dto.RegisterRequest;
import com.company.platform.users.repository.RefreshTokenRepository;
import com.company.platform.users.repository.RoleRepository;
import com.company.platform.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private RoleRepository roleRepository;
    
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private JwtService jwtService;
    
    @Mock
    private AuthenticationManager authenticationManager;
    
    @InjectMocks
    private AuthService authService;
    
    private Role testRole;
    private User testUser;
    
    @BeforeEach
    void setUp() {
        testRole = Role.builder()
                .id(1L)
                .name("Viewer")
                .build();
        
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encodedPassword")
                .firstName("Test")
                .lastName("User")
                .role(testRole)
                .enabled(true)
                .build();
    }
    
    @Test
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("newuser@example.com");
        request.setPassword("password123");
        request.setFirstName("New");
        request.setLastName("User");
        request.setRole("Viewer");
        
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(roleRepository.findByName("Viewer")).thenReturn(Optional.of(testRole));
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateToken(any(), anyString())).thenReturn("accessToken");
        when(refreshTokenRepository.save(any())).thenReturn(null);
        
        AuthResponse response = authService.register(request);
        
        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        verify(userRepository).save(any(User.class));
    }
    
    @Test
    void testRegister_UsernameExists() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("existinguser");
        request.setEmail("new@example.com");
        request.setPassword("password123");
        request.setFirstName("New");
        request.setLastName("User");
        request.setRole("Viewer");
        
        when(userRepository.existsByUsername("existinguser")).thenReturn(true);
        
        assertThrows(ValidationException.class, () -> authService.register(request));
    }
    
    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password123");
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtService.generateToken(any(), anyString())).thenReturn("accessToken");
        when(refreshTokenRepository.save(any())).thenReturn(null);
        
        AuthResponse response = authService.login(request);
        
        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
    
    @Test
    void testLogin_InvalidCredentials() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("wrongpassword");
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));
        
        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }
}
