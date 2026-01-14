package com.company.platform.python.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for Python anomaly detection service.
 * Matches Python-service AnomalyRequest model.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnomalyRequest {
    @NotNull(message = "Metric is required")
    private Double metric;
}
