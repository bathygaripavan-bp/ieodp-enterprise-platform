package com.company.platform.workflows.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new workflow item.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowCreateRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;
    
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;
    
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL
    
    private String category;
    
    private Long assignedToId;
}
