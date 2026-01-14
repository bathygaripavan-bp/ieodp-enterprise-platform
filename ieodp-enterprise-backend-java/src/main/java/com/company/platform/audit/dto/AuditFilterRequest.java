package com.company.platform.audit.dto;

import com.company.platform.audit.domain.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for audit log filtering.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditFilterRequest {
    private AuditAction action;
    private String entityType;
    private Long entityId;
    private Long userId;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private String correlationId;
}
