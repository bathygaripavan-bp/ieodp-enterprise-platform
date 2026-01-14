package com.company.platform.integration.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Health check response DTO for integration endpoints.
 * Compatible with Python-service and external systems.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class HealthCheckResponse {
    private String status;
    private String service;
    private String version;
    private LocalDateTime timestamp;
    private String message;
}
