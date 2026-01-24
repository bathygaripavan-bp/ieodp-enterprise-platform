package com.company.platform.python.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for Python decision support service.
 * Matches Python-service DecisionRequest model.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DecisionRequest {
    @NotNull(message = "Score is required")
    private Integer score;
}
