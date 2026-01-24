package com.company.platform.users.controller;

import com.company.platform.common.response.ApiResponse;
import com.company.platform.users.dto.UserDTO;
import com.company.platform.users.service.UserService;
import com.company.platform.users.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * User management controller.
 * Provides endpoints for user CRUD operations with role-based access control.
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Users", description = "User management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Retrieves the currently authenticated user's profile")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(Authentication authentication) {
        log.info("Fetching current authenticated user");

        com.company.platform.users.domain.User currentUser =
                (com.company.platform.users.domain.User) authentication.getPrincipal();

        UserDTO userDTO = UserDTO.builder()
                .id(currentUser.getId())
                .username(currentUser.getUsername())
                .email(currentUser.getEmail())
                .firstName(currentUser.getFirstName())
                .lastName(currentUser.getLastName())
                .role(currentUser.getRole().getName())
                .enabled(currentUser.getEnabled())
                .createdAt(currentUser.getCreatedAt())
                .updatedAt(currentUser.getUpdatedAt())
                .build();

        return ResponseEntity.ok(ApiResponse.success(userDTO));
    }

    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieves paginated list of all users")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserDTO>>> getAllUsers(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        log.info("Fetching all users");
        Page<UserDTO> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/search")
    @Operation(summary = "Search users", description = "Searches users by username, email, or name")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserDTO>>> searchUsers(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        log.info("Searching users with query: {}", search);
        Page<UserDTO> users = userService.searchUsers(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/role/{roleName}")
    @Operation(summary = "Get users by role", description = "Retrieves users filtered by role")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserDTO>>> getUsersByRole(
            @PathVariable String roleName,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        log.info("Fetching users by role: {}", roleName);
        Page<UserDTO> users = userService.getUsersByRole(roleName, pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieves a specific user by ID")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        log.info("Fetching user: {}", id);
        com.company.platform.users.domain.User user = userService.findById(id);
        UserDTO userDTO = UserDTO.builder()
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
        return ResponseEntity.ok(ApiResponse.success(userDTO));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user", description = "Updates user information")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserDTO userDTO,
            @AuthenticationPrincipal User currentUser) {
        log.info("Updating user: {}", id);
        UserDTO updated = userService.updateUser(id, userDTO, currentUser);
        return ResponseEntity.ok(ApiResponse.success(updated, "User updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user", description = "Deletes a user account")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        log.info("Deleting user: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }

    @GetMapping("/stats/roles")
    @Operation(summary = "Get user counts by role", description = "Returns live counts of users grouped by role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<java.util.Map<String, Long>>> getUserCountsByRole() {
        java.util.Map<String, Long> counts = userService.getUserCountsByRole();
        return ResponseEntity.ok(ApiResponse.success(counts));
    }
}
