package com.company.platform.users.service;

import com.company.platform.common.exception.NotFoundException;
import com.company.platform.common.exception.ValidationException;
import com.company.platform.common.exception.ForbiddenException;
import com.company.platform.users.domain.Role;
import com.company.platform.users.domain.User;
import com.company.platform.users.dto.UserDTO;
import com.company.platform.users.repository.RoleRepository;
import com.company.platform.users.repository.UserRepository;
import com.company.platform.users.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository; // ⬅ Added
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found: " + username));
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        log.info("Fetching all users with pagination");
        return userRepository.findAll(pageable)
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public Page<UserDTO> searchUsers(String search, Pageable pageable) {
        log.info("Searching users with query: {}", search);
        return userRepository.searchUsers(search, pageable)
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public Page<UserDTO> getUsersByRole(String roleName, Pageable pageable) {
        log.info("Fetching users by role: {}", roleName);
        return userRepository.findByRoleName(roleName, pageable)
                .map(this::toDTO);
    }

    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO, User currentUser) {
        log.info("Updating user: {}", id);

        boolean isAdminOrManager = currentUser.getRole() != null &&
                ("ADMIN".equalsIgnoreCase(currentUser.getRole().getName()) ||
                        "MANAGER".equalsIgnoreCase(currentUser.getRole().getName()));

        if (!isAdminOrManager && !currentUser.getId().equals(id)) {
            throw new ForbiddenException("You can only update your own profile");
        }

        User user = findById(id);

        if (userDTO.getEmail() != null && !userDTO.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(userDTO.getEmail())) {
                throw new ValidationException("Email already exists");
            }
            user.setEmail(userDTO.getEmail());
        }

        if (userDTO.getFirstName() != null) {
            user.setFirstName(userDTO.getFirstName());
        }

        if (userDTO.getLastName() != null) {
            user.setLastName(userDTO.getLastName());
        }

        // Only Admin/Manager can change role or enabled status
        if (isAdminOrManager && userDTO.getRole() != null && !userDTO.getRole().equals(user.getRole().getName())) {
            Role newRole = roleRepository.findByName(userDTO.getRole())
                    .orElseThrow(() -> new ValidationException("Invalid role: " + userDTO.getRole()));
            user.setRole(newRole);
        }

        if (isAdminOrManager && userDTO.getEnabled() != null) {
            user.setEnabled(userDTO.getEnabled());
        }

        // Update password if provided (hash it before saving)
        if (userDTO.getPassword() != null && !userDTO.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
            log.info("Password updated for user: {}", user.getUsername());
        }

        user = userRepository.save(user);
        log.info("User updated successfully: {}", user.getUsername());

        return toDTO(user);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(Long id) {
        log.info("Deleting user: {}", id);

        User user = findById(id);

        // 1️⃣ Delete refresh tokens linked to the user
        refreshTokenRepository.deleteByUserId(id);

        // 2️⃣ Delete the user
        userRepository.delete(user);

        log.info("User deleted successfully: {}", id);
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Long> getUserCountsByRole() {
        java.util.List<Object[]> rows = userRepository.countUsersByRole();
        java.util.Map<String, Long> result = new java.util.HashMap<>();
        for (Object[] row : rows) {
            String roleName = (String) row[0];
            Long count = (Long) row[1];
            result.put(roleName, count);
        }
        return result;
    }

    private UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().getName())
                .enabled(user.getEnabled())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
