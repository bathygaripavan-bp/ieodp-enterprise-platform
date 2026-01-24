package com.company.platform.integration.controller;

import com.company.platform.common.response.ApiResponse;
import com.company.platform.integration.dto.HealthCheckResponse;
import com.company.platform.integration.dto.IntegrationStatusResponse;
import com.company.platform.workflows.dto.WorkflowTriggerRequest;
import com.company.platform.workflows.dto.WorkflowTriggerResponse;
import com.company.platform.workflows.service.WorkflowIntegrationService;
import com.company.platform.users.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * Integration Controller for AI/ML services and external microservices.
 * Provides versioned APIs under /api/v1/integration/**
 * 
 * This controller ensures backward compatibility and supports:
 * - Python-based systems
 * - AI/ML automation services
 * - External microservices
 */
@RestController
@RequestMapping("/api/v1/integration")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Integration", description = "Integration endpoints for external systems")
@SecurityRequirement(name = "bearerAuth")
public class IntegrationController {
    
    private final WorkflowIntegrationService workflowIntegrationService;
    
    /**
     * Health check endpoint for integration services.
     * Used by Python-service and external systems to verify connectivity.
     * 
     * GET /api/v1/integration/health
     */
    @GetMapping("/health")
    @Operation(summary = "Integration health check", description = "Health check endpoint for external systems")
    public ResponseEntity<ApiResponse<HealthCheckResponse>> healthCheck() {
        log.debug("Integration health check requested");
        HealthCheckResponse response = HealthCheckResponse.builder()
                .status("UP")
                .service("IEODP Integration API")
                .version("v1")
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    /**
     * Trigger workflow endpoint for external systems.
     * Compatible with Python-service integration_engine.py
     * 
     * POST /api/v1/integration/workflows/trigger
     */
    @PostMapping("/workflows/trigger")
    @Operation(
            summary = "Trigger workflow (Integration)",
            description = "Triggers a workflow from external systems. Compatible with Python-service."
    )
    public ResponseEntity<ApiResponse<WorkflowTriggerResponse>> triggerWorkflow(
            @RequestParam(required = false) String workflowName,
            @Valid @RequestBody(required = false) WorkflowTriggerRequest request,
            @AuthenticationPrincipal User currentUser) {
        
        if (request == null) {
            request = new WorkflowTriggerRequest();
        }
        
        log.info("Integration workflow trigger: name={}, source={}", 
                workflowName != null ? workflowName : "default", request.getSource());
        
        String name = workflowName != null ? workflowName : 
                (request.getMetadata() != null && request.getMetadata().containsKey("workflowName") ?
                        request.getMetadata().get("workflowName").toString() : "integration_trigger");
        
        WorkflowTriggerResponse response = workflowIntegrationService.triggerWorkflow(
                name, request, currentUser);
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-API-Version", "v1");
        headers.add("X-Deprecated", "false");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(ApiResponse.success(response, "Workflow triggered successfully"));
    }
    
    /**
     * Get integration status.
     * Provides status information for external systems.
     * 
     * GET /api/v1/integration/status
     */
    @GetMapping("/status")
    @Operation(summary = "Get integration status", description = "Returns integration API status and capabilities")
    public ResponseEntity<ApiResponse<IntegrationStatusResponse>> getStatus() {
        log.debug("Integration status requested");
        
        IntegrationStatusResponse response = IntegrationStatusResponse.builder()
                .apiVersion("v1")
                .status("ACTIVE")
                .supportedFeatures(java.util.List.of(
                        "workflow_trigger",
                        "health_check",
                        "status_check"
                ))
                .timestamp(LocalDateTime.now())
                .build();
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-API-Version", "v1");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(ApiResponse.success(response));
    }
}
