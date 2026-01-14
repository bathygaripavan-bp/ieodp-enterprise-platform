package com.company.platform.workflows.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating a workflow item.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowUpdateRequest {
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;
    
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;
    
    private String priority;
    
    private String category;
    
    private Long assignedToId;
    
    @Size(max = 500, message = "Comments must not exceed 500 characters")
    private String comments;
}
