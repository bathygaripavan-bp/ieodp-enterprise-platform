package com.company.platform.audit.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.company.platform.audit.domain.AuditAction;
import com.company.platform.audit.domain.AuditLog;
import com.company.platform.audit.dto.AuditFilterRequest;
import com.company.platform.audit.dto.AuditLogResponse;
import com.company.platform.common.util.CorrelationIdUtil;
import com.company.platform.users.domain.User;
import com.company.platform.audit.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;


import java.util.Map;

/**
 * Audit service for logging and retrieving audit trails.
 * Ensures compliance and traceability of all system actions.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {
    
    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * Log an audit action.
     * This method is transactional to ensure audit logs are never lost.
     */
    @Transactional
    public void logAction(
            AuditAction action,
            String entityType,
            Long entityId,
            String details,
            User performedBy,
            Map<String, String> oldValues,
            Map<String, String> newValues
    ) throws JsonProcessingException {
        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .performedBy(performedBy)
                .correlationId(CorrelationIdUtil.getOrGenerateCorrelationId())
                .oldValues(oldValues != null ? objectMapper.writeValueAsString(oldValues) : null)
                .newValues(newValues != null ? objectMapper.writeValueAsString(newValues) : null)
                .build();

        // Extract request information if available
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            auditLog.setIpAddress(getClientIpAddress(request));
            auditLog.setUserAgent(request.getHeader("User-Agent"));
            auditLog.setRequestMethod(request.getMethod());
            auditLog.setRequestPath(request.getRequestURI());
        }

        auditLogRepository.save(auditLog);
        log.debug("Audit log created: action={}, entity={}, id={}", action, entityType, entityId);
    }
    
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('REVIEWER') or hasRole('ADMIN') or hasRole('MANAGER')")
    public Page<AuditLogResponse> getAuditLogs(AuditFilterRequest filter, Pageable pageable) {
        log.info("Fetching audit logs with filters");
        return auditLogRepository.searchAuditLogs(
                filter.getAction(),
                filter.getEntityType(),
                filter.getEntityId(),
                filter.getUserId(),
                filter.getFromDate(),
                filter.getToDate(),
                filter.getCorrelationId(),
                pageable
        ).map(this::toDTO);
    }
    
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('REVIEWER') or hasRole('ADMIN')")
    public Page<AuditLogResponse> getAuditLogsByEntity(String entityType, Long entityId, Pageable pageable) {
        log.info("Fetching audit logs for entity: type={}, id={}", entityType, entityId);
        return auditLogRepository.findByEntity(entityType, entityId, pageable)
                .map(this::toDTO);
    }
    
    private AuditLogResponse toDTO(AuditLog auditLog) {
        return AuditLogResponse.builder()
                .id(auditLog.getId())
                .action(auditLog.getAction())
                .entityType(auditLog.getEntityType())
                .entityId(auditLog.getEntityId())
                .details(auditLog.getDetails())
                .performedById(auditLog.getPerformedBy() != null ? auditLog.getPerformedBy().getId() : null)
                .performedByUsername(auditLog.getPerformedBy() != null ? 
                        auditLog.getPerformedBy().getUsername() : null)
                .ipAddress(auditLog.getIpAddress())
                .correlationId(auditLog.getCorrelationId())
                .createdAt(auditLog.getCreatedAt())
                .build();
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}
