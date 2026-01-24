package com.company.platform.config;

import com.company.platform.users.domain.Permission;
import com.company.platform.users.domain.Role;
import com.company.platform.users.domain.User;
import com.company.platform.users.repository.PermissionRepository;
import com.company.platform.users.repository.RoleRepository;
import com.company.platform.users.repository.UserRepository;
import com.company.platform.workflows.domain.WorkflowAction;
import com.company.platform.workflows.domain.WorkflowState;
import com.company.platform.workflows.domain.WorkflowTransition;
import com.company.platform.workflows.repository.WorkflowTransitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.HashSet;
import java.util.Set;

/**
 * Data initializer for development.
 * Creates default roles, permissions, users, and workflow transitions.
 * Only runs in development profile.
 */
@Component
@Profile("!prod")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final WorkflowTransitionRepository workflowTransitionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    private final PlatformTransactionManager transactionManager;
    
    @Override
    public void run(String... args) {
        log.info("Initializing default data...");
        
        // Fix audit_logs table structure (missing AUTO_INCREMENT)
        // This must be done outside of a transaction because DDL commits the transaction
        fixAuditLogsTable();
        
        // Run data initialization in a transaction
        new TransactionTemplate(transactionManager).execute(status -> {
            // Create permissions
            createPermissions();
            
            // Migrate old roles to new role names (must be done before creating roles)
            migrateOldRoles();
            
            // Create roles
            createRoles();
            
            // Create default users
            createDefaultUsers();
            
            // Create workflow transitions
            createWorkflowTransitions();
            
            return null;
        });
        
        log.info("Data initialization completed");
    }
    
    private void fixAuditLogsTable() {
        try {
            log.info("Checking audit_logs table structure...");
            // Fix for "Field 'id' doesn't have a default value" error
            jdbcTemplate.execute("ALTER TABLE audit_logs MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT");
            log.info("Successfully ensured audit_logs.id is AUTO_INCREMENT");
        } catch (Exception e) {
            // Log warning but continue - table might already be correct or other issue
            log.warn("Could not alter audit_logs table: {}. This is expected if the table is already correct.", e.getMessage());
        }
    }
    
    private void createPermissions() {
        for (Permission.PermissionName permName : Permission.PermissionName.values()) {
            if (permissionRepository.findByName(permName.name()).isEmpty()) {
                Permission permission = Permission.builder()
                        .name(permName.name())
                        .description("Permission: " + permName.name())
                        .build();
                permissionRepository.save(permission);
                log.debug("Created permission: {}", permName.name());
            }
        }
    }
    
    /**
     * Migrate old role names to new role names.
     * This handles the transition from OPERATIONS/MANAGER/LEADERSHIP/AUDITOR to Viewer/Manager/Admin/Reviewer.
     * Also updates workflow transitions and users that reference the old roles.
     */
    private void migrateOldRoles() {
        // Map old roles to new roles
        String[][] roleMappings = {
            {"OPERATIONS", "VIEWER"},
            {"MANAGER", "MANAGER"},
            {"LEADERSHIP", "ADMIN"},
            {"AUDITOR", "REVIEWER"}
        };
        
        for (String[] mapping : roleMappings) {
            String oldRoleName = mapping[0];
            String newRoleName = mapping[1];
            
            roleRepository.findByName(oldRoleName).ifPresent(oldRole -> {
                // Skip if old and new names are the same (e.g., MANAGER -> Manager)
                if (oldRoleName.equalsIgnoreCase(newRoleName)) {
                    log.debug("Role name unchanged: {}", oldRoleName);
                    return;
                }
                
                // Check if new role already exists
                roleRepository.findByName(newRoleName).ifPresentOrElse(existingNewRole -> {
                    log.info("Role {} already exists. Updating references from {} to {}", 
                            newRoleName, oldRoleName, newRoleName);
                    
                    final Role finalNewRole = existingNewRole;
                    
                    // Update workflow transitions to point to new role
                    workflowTransitionRepository.findAll().forEach(transition -> {
                        if (transition.getAllowedRole() != null && 
                            transition.getAllowedRole().getName().equals(oldRoleName)) {
                            transition.setAllowedRole(finalNewRole);
                            workflowTransitionRepository.save(transition);
                            log.debug("Updated workflow transition to use role: {}", newRoleName);
                        }
                    });
                    
                    // Update users to use new role
                    userRepository.findAll().forEach(user -> {
                        if (user.getRole() != null && user.getRole().getName().equals(oldRoleName)) {
                            user.setRole(finalNewRole);
                            userRepository.save(user);
                            log.debug("Updated user {} to use role: {}", user.getUsername(), newRoleName);
                        }
                    });
                    
                    // Delete old role after updating references
                    try {
                        roleRepository.delete(oldRole);
                        log.info("Deleted old role: {}", oldRoleName);
                    } catch (Exception e) {
                        log.warn("Could not delete old role {}: {}. It may still have references.", 
                                oldRoleName, e.getMessage());
                    }
                }, () -> {
                    // New role doesn't exist, rename the old role
                    log.info("Migrating role {} to {}", oldRoleName, newRoleName);
                    try {
                        oldRole.setName(newRoleName);
                        roleRepository.save(oldRole);
                        log.info("Successfully migrated role {} to {}", oldRoleName, newRoleName);
                    } catch (Exception e) {
                        log.error("Failed to migrate role {} to {}: {}", oldRoleName, newRoleName, e.getMessage());
                        // If migration fails, try to create new role and update references
                        try {
                            final Role createdNewRole = roleRepository.save(Role.builder()
                                    .name(newRoleName)
                                    .description(oldRole.getDescription())
                                    .permissions(oldRole.getPermissions())
                                    .build());
                            
                            final Long oldRoleId = oldRole.getId();
                            
                            // Update references
                            workflowTransitionRepository.findAll().forEach(transition -> {
                                if (transition.getAllowedRole() != null && 
                                    transition.getAllowedRole().getId().equals(oldRoleId)) {
                                    transition.setAllowedRole(createdNewRole);
                                    workflowTransitionRepository.save(transition);
                                }
                            });
                            
                            userRepository.findAll().forEach(user -> {
                                if (user.getRole() != null && user.getRole().getId().equals(oldRoleId)) {
                                    user.setRole(createdNewRole);
                                    userRepository.save(user);
                                }
                            });
                            
                            roleRepository.delete(oldRole);
                            log.info("Created new role {} and migrated all references", newRoleName);
                        } catch (Exception e2) {
                            log.error("Failed to create new role and migrate: {}", e2.getMessage());
                        }
                    }
                });
            });
        }
    }
    
    private void createRoles() {
        log.info("Creating roles...");
        
        // Viewer role
        Role viewerRole = createRoleIfNotExists(
                Role.RoleName.VIEWER.name(),
                "Viewer with basic workflow access",
                Set.of(
                        Permission.PermissionName.WORKFLOW_CREATE,
                        Permission.PermissionName.WORKFLOW_READ,
                        Permission.PermissionName.WORKFLOW_UPDATE
                )
        );
        log.info("Viewer role created/found: {}", viewerRole != null ? viewerRole.getName() : "null");
        
        // Manager role
        Role managerRole = createRoleIfNotExists(
                Role.RoleName.MANAGER.name(),
                "Manager with review and approval capabilities",
                Set.of(
                        Permission.PermissionName.WORKFLOW_CREATE,
                        Permission.PermissionName.WORKFLOW_READ,
                        Permission.PermissionName.WORKFLOW_UPDATE,
                        Permission.PermissionName.WORKFLOW_REVIEW,
                        Permission.PermissionName.WORKFLOW_APPROVE,
                        Permission.PermissionName.WORKFLOW_REJECT,
                        Permission.PermissionName.USER_READ,
                        Permission.PermissionName.AUDIT_READ
                )
        );
        log.info("Manager role created/found: {}", managerRole != null ? managerRole.getName() : "null");
        
        // Admin role
        Role adminRole = createRoleIfNotExists(
                Role.RoleName.ADMIN.name(),
                "Admin with full access",
                Set.of(
                        Permission.PermissionName.values()
                )
        );
        log.info("Admin role created/found: {}", adminRole != null ? adminRole.getName() : "null");
        
        // Reviewer role
        Role reviewerRole = createRoleIfNotExists(
                Role.RoleName.REVIEWER.name(),
                "Reviewer with read-only access to audit logs",
                Set.of(
                        Permission.PermissionName.AUDIT_READ,
                        Permission.PermissionName.AUDIT_EXPORT,
                        Permission.PermissionName.WORKFLOW_READ
                )
        );
        log.info("Reviewer role created/found: {}", reviewerRole != null ? reviewerRole.getName() : "null");
        
        // Verify all roles exist
        verifyRolesExist();
    }
    
    /**
     * Verify that all required roles exist in the database.
     */
    private void verifyRolesExist() {
        String[] requiredRoles = {
                Role.RoleName.VIEWER.name(),
                Role.RoleName.MANAGER.name(),
                Role.RoleName.ADMIN.name(),
                Role.RoleName.REVIEWER.name()
        };
        
        for (String roleName : requiredRoles) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                log.error("CRITICAL: Required role '{}' does not exist in database!", roleName);
            } else {
                log.debug("Verified role exists: {}", roleName);
            }
        }
    }
    
    private Role createRoleIfNotExists(String name, String description, Set<Permission.PermissionName> permissionNames) {
        return roleRepository.findByName(name)
                .orElseGet(() -> {
                    Set<Permission> permissions = new HashSet<>();
                    for (Permission.PermissionName permName : permissionNames) {
                        permissionRepository.findByName(permName.name())
                                .ifPresent(permissions::add);
                    }
                    
                    Role role = Role.builder()
                            .name(name)
                            .description(description)
                            .permissions(permissions)
                            .build();
                    Role saved = roleRepository.save(role);
                    log.debug("Created role: {}", name);
                    return saved;
                });
    }
    
    private void createDefaultUsers() {
        // Create admin user
        if (userRepository.findByUsername("admin").isEmpty()) {
            Role adminRole = roleRepository.findByName(Role.RoleName.ADMIN.name())
                    .orElseThrow();
            
            User admin = User.builder()
                    .username("admin")
                    .email("admin@ieodp.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("Admin")
                    .lastName("User")
                    .role(adminRole)
                    .enabled(true)
                    .accountNonExpired(true)
                    .accountNonLocked(true)
                    .credentialsNonExpired(true)
                    .build();
            userRepository.save(admin);
            log.info("Created default admin user: admin/admin123");
        }
    }
    
    private void createWorkflowTransitions() {
        // Try to find roles, if they don't exist, log warning and skip
        Role viewerRole = roleRepository.findByName(Role.RoleName.VIEWER.name())
                .orElse(null);
        Role managerRole = roleRepository.findByName(Role.RoleName.MANAGER.name())
                .orElse(null);
        Role adminRole = roleRepository.findByName(Role.RoleName.ADMIN.name())
                .orElse(null);
        
        if (viewerRole == null || managerRole == null || adminRole == null) {
            log.warn("Required roles not found. Skipping workflow transition creation. " +
                    "Viewer: {}, Manager: {}, Admin: {}", 
                    viewerRole != null, managerRole != null, adminRole != null);
            return;
        }
        
        // Clean up old workflow transitions with old roles first
        cleanupOldWorkflowTransitions();
        
        // CREATED -> REVIEWED (by Viewer or Manager)
        createTransitionIfNotExists(WorkflowState.CREATED, WorkflowState.REVIEWED, 
                WorkflowAction.SUBMIT, viewerRole);
        createTransitionIfNotExists(WorkflowState.CREATED, WorkflowState.REVIEWED, 
                WorkflowAction.REVIEW, managerRole);
        
        // REVIEWED -> APPROVED (by Manager or Admin)
        createTransitionIfNotExists(WorkflowState.REVIEWED, WorkflowState.APPROVED, 
                WorkflowAction.APPROVE, managerRole);
        createTransitionIfNotExists(WorkflowState.REVIEWED, WorkflowState.APPROVED, 
                WorkflowAction.APPROVE, adminRole);
        
        // REVIEWED -> REJECTED (by Manager or Admin)
        createTransitionIfNotExists(WorkflowState.REVIEWED, WorkflowState.REJECTED, 
                WorkflowAction.REJECT, managerRole);
        createTransitionIfNotExists(WorkflowState.REVIEWED, WorkflowState.REJECTED, 
                WorkflowAction.REJECT, adminRole);
        
        // APPROVED -> REJECTED (by Admin only)
        createTransitionIfNotExists(WorkflowState.APPROVED, WorkflowState.REJECTED, 
                WorkflowAction.REJECT, adminRole);
        
        // REJECTED -> REOPENED (by Viewer or Manager)
        createTransitionIfNotExists(WorkflowState.REJECTED, WorkflowState.REOPENED, 
                WorkflowAction.REOPEN, viewerRole);
        createTransitionIfNotExists(WorkflowState.REJECTED, WorkflowState.REOPENED, 
                WorkflowAction.REOPEN, managerRole);
        
        // REOPENED -> CREATED (by Viewer)
        createTransitionIfNotExists(WorkflowState.REOPENED, WorkflowState.CREATED, 
                WorkflowAction.SUBMIT, viewerRole);
        
        // ADDED: CREATED -> REVIEWED (by Admin) - Fix for the error
        createTransitionIfNotExists(WorkflowState.CREATED, WorkflowState.REVIEWED, 
                WorkflowAction.SUBMIT, adminRole);
        createTransitionIfNotExists(WorkflowState.CREATED, WorkflowState.REVIEWED, 
                WorkflowAction.REVIEW, adminRole);
    }
    
    /**
     * Clean up old workflow transitions that reference old role names.
     */
    private void cleanupOldWorkflowTransitions() {
        String[] oldRoleNames = {"OPERATIONS", "LEADERSHIP", "AUDITOR"};
        for (String oldRoleName : oldRoleNames) {
            roleRepository.findByName(oldRoleName).ifPresent(oldRole -> {
                log.info("Cleaning up workflow transitions for old role: {}", oldRoleName);
                workflowTransitionRepository.findAll().stream()
                        .filter(transition -> transition.getAllowedRole() != null && 
                                transition.getAllowedRole().getName().equals(oldRoleName))
                        .forEach(transition -> {
                            log.debug("Deleting old workflow transition with role: {}", oldRoleName);
                            workflowTransitionRepository.delete(transition);
                        });
            });
        }
    }
    
    private void createTransitionIfNotExists(WorkflowState fromState, WorkflowState toState, 
                                             WorkflowAction action, Role allowedRole) {
        if (workflowTransitionRepository.findByFromStateAndAction(fromState, action).isEmpty()) {
            WorkflowTransition transition = WorkflowTransition.builder()
                    .fromState(fromState)
                    .toState(toState)
                    .action(action)
                    .allowedRole(allowedRole)
                    .description(String.format("%s -> %s via %s", fromState, toState, action))
                    .build();
            workflowTransitionRepository.save(transition);
            log.debug("Created workflow transition: {} -> {} via {}", fromState, toState, action);
        }
    }
}
