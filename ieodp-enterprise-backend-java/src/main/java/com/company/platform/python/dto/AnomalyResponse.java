package com.company.platform.python.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO from Python anomaly detection service.
 * Matches Python-service AnomalyResponse model.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AnomalyResponse {
    private Boolean anomalous;
    private Double score;
    private List<String> explanation;
}
