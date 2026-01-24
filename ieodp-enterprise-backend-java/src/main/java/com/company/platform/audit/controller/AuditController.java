package com.company.platform.audit.controller;

import com.company.platform.audit.dto.AuditFilterRequest;
import com.company.platform.audit.dto.AuditLogResponse;
import com.company.platform.audit.service.AuditService;
import com.company.platform.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Audit log controller.
 * Provides endpoints for retrieving audit trails.
 */
@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Audit", description = "Audit log endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AuditController {
    
    private final AuditService auditService;
    
    @GetMapping
    @Operation(summary = "Get audit logs", description = "Retrieves paginated audit logs with filters")
    @PreAuthorize("hasRole('REVIEWER') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getAuditLogs(
            @ModelAttribute AuditFilterRequest filter,
            @PageableDefault(size = 50, sort = "createdAt") Pageable pageable) {
        log.info("Fetching audit logs with filters");
        Page<AuditLogResponse> logs = auditService.getAuditLogs(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
    
    @GetMapping("/entity/{entityType}/{entityId}")
    @Operation(summary = "Get audit logs by entity", description = "Retrieves audit logs for a specific entity")
    @PreAuthorize("hasRole('REVIEWER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getAuditLogsByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            @PageableDefault(size = 50, sort = "createdAt") Pageable pageable) {
        log.info("Fetching audit logs for entity: type={}, id={}", entityType, entityId);
        Page<AuditLogResponse> logs = auditService.getAuditLogsByEntity(entityType, entityId, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
