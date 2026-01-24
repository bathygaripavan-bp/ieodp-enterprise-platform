package com.company.platform.audit.dto;

import com.company.platform.audit.domain.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for audit log response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private AuditAction action;
    private String entityType;
    private Long entityId;
    private String details;
    private Long performedById;
    private String performedByUsername;
    private String ipAddress;
    private String correlationId;
    private LocalDateTime createdAt;
}
