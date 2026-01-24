package com.company.platform.python.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO from Python risk evaluation service.
 * Matches Python-service RiskResponse model.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RiskResponse {
    @JsonProperty("risk_level")
    private String riskLevel;
    private Double confidence;
    private List<String> reasons;
}
