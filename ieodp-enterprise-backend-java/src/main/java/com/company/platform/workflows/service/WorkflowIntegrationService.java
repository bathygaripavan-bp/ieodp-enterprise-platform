package com.company.platform.workflows.service;

import com.company.platform.audit.domain.AuditAction;
import com.company.platform.audit.service.AuditService;
import com.company.platform.common.exception.NotFoundException;
import com.company.platform.common.exception.ValidationException;
import com.company.platform.common.util.CorrelationIdUtil;
import com.company.platform.users.domain.User;
import com.company.platform.workflows.domain.WorkflowAction;
import com.company.platform.workflows.domain.WorkflowItem;
import com.company.platform.workflows.domain.WorkflowState;
import com.company.platform.workflows.dto.WorkflowTriggerRequest;
import com.company.platform.workflows.dto.WorkflowTriggerResponse;
import com.company.platform.workflows.repository.WorkflowItemRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Integration service for Python-service and external microservices.
 * Handles workflow triggers from external systems with backward compatibility guarantees.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowIntegrationService {
    
    private final WorkflowItemRepository workflowRepository;
    private final WorkflowEngine workflowEngine;
    private final AuditService auditService;
    
    /**
     * Trigger a workflow by name from external system (Python-service, AI/ML services, etc.)
     * This method ensures backward compatibility - existing Python-service code continues working.
     * 
     * @param workflowName Name of the workflow to trigger
     * @param request Trigger request from external system
     * @param currentUser Authenticated user (from JWT token)
     * @return Trigger response compatible with Python-service expectations
     */
    @Transactional
    public WorkflowTriggerResponse triggerWorkflow(
            String workflowName,
            WorkflowTriggerRequest request,
            User currentUser) {
        
        log.info("Triggering workflow: name={}, source={}, user={}", 
                workflowName, request.getSource(), currentUser.getUsername());
        
        String correlationId = CorrelationIdUtil.getOrGenerateCorrelationId();
        
        try {
            // Handle different workflow trigger scenarios
            if (request.getWorkflowId() != null) {
                // Trigger existing workflow
                return triggerExistingWorkflow(request.getWorkflowId(), request, currentUser, correlationId);
            } else {
                // Handle workflow by name (e.g., "periodic_sync" from Python-service)
                return handleWorkflowByName(workflowName, request, currentUser, correlationId);
            }
            
        } catch (Exception e) {
            log.error("Error triggering workflow: name={}, error={}", workflowName, e.getMessage(), e);
            return WorkflowTriggerResponse.builder()
                    .status("FAILED")
                    .success(false)
                    .workflowName(workflowName)
                    .message("Failed to trigger workflow: " + e.getMessage())
                    .timestamp(LocalDateTime.now())
                    .correlationId(correlationId)
                    .build();
        }
    }
    
    /**
     * Trigger an existing workflow by ID
     */
    private WorkflowTriggerResponse triggerExistingWorkflow(
            Long workflowId,
            WorkflowTriggerRequest request,
            User currentUser,
            String correlationId) throws JsonProcessingException {
        
        WorkflowItem workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new NotFoundException("Workflow not found: " + workflowId));
        
        // If action is provided, perform state transition
        if (request.getAction() != null) {
            try {
                WorkflowAction action = WorkflowAction.valueOf(request.getAction().toUpperCase());
                WorkflowState oldState = workflow.getState();
                WorkflowState newState = workflowEngine.processTransition(workflow, action, currentUser);
                
                workflow.setState(newState);
                if (request.getComments() != null) {
                    workflow.setComments(request.getComments());
                }
                
                workflow = workflowRepository.save(workflow);
                
                // Audit log
                auditService.logAction(
                        AuditAction.WORKFLOW_UPDATED,
                        "WorkflowItem",
                        workflow.getId(),
                        String.format("Workflow triggered by %s: %s -> %s", 
                                request.getSource(), oldState, newState),
                        currentUser,
                        Map.of("state", oldState.name(), "source", request.getSource()),
                        Map.of("state", newState.name(), "source", request.getSource())
                );
                
                return WorkflowTriggerResponse.builder()
                        .status("SUCCESS")
                        .success(true)
                        .workflowId(workflow.getId())
                        .workflowName(workflow.getTitle())
                        .state(newState.name())
                        .message("Workflow triggered successfully")
                        .timestamp(LocalDateTime.now())
                        .correlationId(correlationId)
                        .data(Map.of("oldState", oldState.name(), "newState", newState.name()))
                        .build();
                        
            } catch (IllegalArgumentException e) {
                throw new ValidationException("Invalid workflow action: " + request.getAction());
            }
        } else {
            // Just acknowledge the trigger without state change
            return WorkflowTriggerResponse.builder()
                    .status("SUCCESS")
                    .success(true)
                    .workflowId(workflow.getId())
                    .workflowName(workflow.getTitle())
                    .state(workflow.getState().name())
                    .message("Workflow trigger acknowledged")
                    .timestamp(LocalDateTime.now())
                    .correlationId(correlationId)
                    .build();
        }
    }
    
    /**
     * Handle workflow trigger by name (for Python-service periodic sync, etc.)
     */
    private WorkflowTriggerResponse handleWorkflowByName(
            String workflowName,
            WorkflowTriggerRequest request,
            User currentUser,
            String correlationId) throws JsonProcessingException {
        
        log.info("Handling workflow trigger by name: {}", workflowName);
        
        // For named workflows like "periodic_sync", we can:
        // 1. Create a new workflow item
        // 2. Or just acknowledge the trigger
        
        // Check if there's a workflow template or existing workflow to update
        // For now, we'll create a simple acknowledgment workflow or log the event
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("workflowName", workflowName);
        responseData.put("source", request.getSource());
        if (request.getPayload() != null) {
            responseData.put("payload", request.getPayload());
        }
        
        // Audit log for integration trigger
        // Convert Map<String, Object> to Map<String, String> for audit service
        Map<String, String> auditData = new HashMap<>();
        responseData.forEach((key, value) -> auditData.put(key, value != null ? value.toString() : null));
        
        auditService.logAction(
                AuditAction.WORKFLOW_CREATED,
                "WorkflowIntegration",
                null,
                String.format("Workflow trigger received: %s from %s", workflowName, request.getSource()),
                currentUser,
                null,
                auditData
        );
        
        return WorkflowTriggerResponse.builder()
                .status("SUCCESS")
                .success(true)
                .workflowName(workflowName)
                .state("TRIGGERED")
                .message("Workflow trigger processed successfully")
                .timestamp(LocalDateTime.now())
                .correlationId(correlationId)
                .data(responseData)
                .build();
    }
}
