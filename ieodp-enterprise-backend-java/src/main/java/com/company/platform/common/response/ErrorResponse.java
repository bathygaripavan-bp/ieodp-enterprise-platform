package com.company.platform.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standardized error response format.
 * Used by GlobalExceptionHandler for consistent error reporting.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private String message;
    private String errorCode;
    private LocalDateTime timestamp;
    private String path;
    private String correlationId;
    private Map<String, String> fieldErrors;
    
    public static ErrorResponse of(String message, String errorCode, String path) {
        return ErrorResponse.builder()
                .message(message)
                .errorCode(errorCode)
                .timestamp(LocalDateTime.now())
                .path(path)
                .build();
    }
}
