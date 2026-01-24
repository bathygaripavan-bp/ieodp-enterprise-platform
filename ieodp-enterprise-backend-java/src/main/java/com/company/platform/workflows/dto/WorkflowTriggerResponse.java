package com.company.platform.workflows.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for workflow trigger response.
 * Designed for Python-service and external integrations with backward compatibility guarantee.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WorkflowTriggerResponse {
    
    /**
     * Status of the trigger operation
     */
    private String status;
    
    /**
     * Success indicator
     */
    private boolean success;
    
    /**
     * Workflow ID if a workflow was created or updated
     */
    private Long workflowId;
    
    /**
     * Workflow name that was triggered
     */
    private String workflowName;
    
    /**
     * Current workflow state
     */
    private String state;
    
    /**
     * Message describing the result
     */
    private String message;
    
    /**
     * Timestamp of the operation
     */
    private LocalDateTime timestamp;
    
    /**
     * Correlation ID for tracking
     */
    private String correlationId;
    
    /**
     * Additional response data - flexible structure for future extensions
     */
    private Map<String, Object> data;
    
    /**
     * Extension fields for future compatibility
     */
    private Map<String, Object> metadata;
}
