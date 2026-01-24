package com.company.platform.audit.domain;

/**
 * Audit action enumeration.
 * Defines all auditable actions in the system.
 */
public enum AuditAction {
    // Authentication actions
    LOGIN,
    LOGOUT,
    TOKEN_REFRESH,
    
    // User actions
    USER_CREATED,
    USER_UPDATED,
    USER_DELETED,
    USER_ACTIVATED,
    USER_DEACTIVATED,
    
    // Workflow actions
    WORKFLOW_CREATED,
    WORKFLOW_UPDATED,
    WORKFLOW_DELETED,
    WORKFLOW_STATE_CHANGED,
    WORKFLOW_REVIEWED,
    WORKFLOW_APPROVED,
    WORKFLOW_REJECTED,
    WORKFLOW_REOPENED,
    WORKFLOW_SUBMITTED, // Added to fix data truncation error
    
    // System actions
    PERMISSION_GRANTED,
    PERMISSION_REVOKED,
    ROLE_ASSIGNED,
    ROLE_REMOVED
}
