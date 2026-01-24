package com.company.platform.audit.domain;

import com.company.platform.common.domain.BaseEntity;
import com.company.platform.users.domain.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Audit log entity for compliance and traceability.
 * Records all significant actions in the system with full context.
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_user", columnList = "performed_by_id"),
    @Index(name = "idx_audit_entity", columnList = "entity_type,entity_id"),
    @Index(name = "idx_audit_timestamp", columnList = "created_at"),
    @Index(name = "idx_audit_correlation", columnList = "correlation_id")
})
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AuditAction action;
    
    @Column(name = "entity_type", length = 100)
    private String entityType; // e.g., "WorkflowItem", "User"
    
    @Column(name = "entity_id")
    private Long entityId;
    
    @Column(columnDefinition = "TEXT")
    private String details;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_id")
    private User performedBy;
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @Column(name = "user_agent", length = 500)
    private String userAgent;
    
    @Column(name = "correlation_id", length = 100)
    private String correlationId;
    
    @Column(name = "request_method", length = 10)
    private String requestMethod;
    
    @Column(name = "request_path", length = 500)
    private String requestPath;
    
    @Column(name = "old_values", columnDefinition = "TEXT")
    private String oldValues; // JSON representation of old state
    
    @Column(name = "new_values", columnDefinition = "TEXT")
    private String newValues; // JSON representation of new state
}
