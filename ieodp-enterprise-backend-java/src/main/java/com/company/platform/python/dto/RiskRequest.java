package com.company.platform.python.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for Python risk evaluation service.
 * Matches Python-service RiskRequest model.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RiskRequest {
    @NotNull(message = "Amount is required")
    private Double amount;
    
    @NotNull(message = "User score is required")
    @JsonProperty("user_score")
    private Integer userScore;
}
