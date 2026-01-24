package com.company.platform.workflows.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO for workflow trigger request from Python-service and external integrations.
 * This DTO is designed for backward compatibility - fields can be extended but never removed.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WorkflowTriggerRequest {
    
    /**
     * Source system identifier (e.g., "python-integration-service", "ai-ml-service")
     * Optional - defaults to "manual" if not provided
     */
    private String source;
    
    /**
     * Payload data - flexible structure to support various integration scenarios
     */
    private Map<String, Object> payload;
    
    /**
     * Optional workflow action to trigger
     */
    private String action;
    
    /**
     * Optional comments/notes
     */
    private String comments;
    
    /**
     * Optional workflow ID if triggering an existing workflow
     */
    private Long workflowId;
    
    /**
     * Extension fields for future compatibility - can be added without breaking existing clients
     */
    private Map<String, Object> metadata;
}
