package com.company.platform.python.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Request DTO for Python ingestion service.
 * Matches Python-service IngestionRequest model.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class IngestionRequest {
    @NotBlank(message = "Source is required")
    private String source;
    
    private Map<String, Object> payload;
}
