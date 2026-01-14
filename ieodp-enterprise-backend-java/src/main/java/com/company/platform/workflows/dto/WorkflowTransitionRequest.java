package com.company.platform.workflows.dto;

import com.company.platform.workflows.domain.WorkflowAction;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for workflow state transition request.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTransitionRequest {
    @NotNull(message = "Action is required")
    private WorkflowAction action;
    
    private String comments;
}
