package com.company.platform.users.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Permission entity for fine-grained access control.
 * Permissions are assigned to roles, not directly to users.
 */
@Entity
@Table(name = "permissions", indexes = {
    @Index(name = "idx_permission_name", columnList = "name", unique = true)
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Permission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String name;
    
    @Column(length = 255)
    private String description;
    
    public enum PermissionName {
        // Workflow permissions
        WORKFLOW_CREATE,
        WORKFLOW_READ,
        WORKFLOW_UPDATE,
        WORKFLOW_DELETE,
        WORKFLOW_REVIEW,
        WORKFLOW_APPROVE,
        WORKFLOW_REJECT,
        WORKFLOW_REOPEN,
        
        // User management permissions
        USER_CREATE,
        USER_READ,
        USER_UPDATE,
        USER_DELETE,
        
        // Audit permissions
        AUDIT_READ,
        AUDIT_EXPORT
    }
}
