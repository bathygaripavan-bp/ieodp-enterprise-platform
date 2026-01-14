package com.company.platform.common.exception;

import com.company.platform.common.response.ApiResponse;
import com.company.platform.common.response.ErrorResponse;
import com.company.platform.common.util.CorrelationIdUtil;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.InvalidDataAccessApiUsageException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for consistent error responses.
 * Provides standardized error format across all endpoints.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleBusinessException(
            BusinessException ex, WebRequest request) {
        log.warn("Business exception: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.of(
                ex.getMessage(),
                ex.getErrorCode(),
                ((ServletWebRequest) request).getRequest().getRequestURI()
        );
        errorResponse.setCorrelationId(CorrelationIdUtil.getOrGenerateCorrelationId());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage(), ex.getErrorCode()));
    }
    
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleNotFoundException(
            NotFoundException ex, WebRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.of(
                ex.getMessage(),
                "RESOURCE_NOT_FOUND",
                ((ServletWebRequest) request).getRequest().getRequestURI()
        );
        errorResponse.setCorrelationId(CorrelationIdUtil.getOrGenerateCorrelationId());
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage(), "RESOURCE_NOT_FOUND"));
    }
    
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleUnauthorizedException(
            UnauthorizedException ex, WebRequest request) {
        log.warn("Unauthorized: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.of(
                ex.getMessage(),
                "UNAUTHORIZED",
                ((ServletWebRequest) request).getRequest().getRequestURI()
        );
        errorResponse.setCorrelationId(CorrelationIdUtil.getOrGenerateCorrelationId());
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(ex.getMessage(), "UNAUTHORIZED"));
    }
    
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleForbiddenException(
            ForbiddenException ex, WebRequest request) {
        log.warn("Forbidden: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.of(
                ex.getMessage(),
                "FORBIDDEN",
                ((ServletWebRequest) request).getRequest().getRequestURI()
        );
        errorResponse.setCorrelationId(CorrelationIdUtil.getOrGenerateCorrelationId());
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(ex.getMessage(), "FORBIDDEN"));
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleValidationException(
            ValidationException ex, WebRequest request) {
        log.warn("Validation error: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.of(
                ex.getMessage(),
                "VALIDATION_ERROR",
                ((ServletWebRequest) request).getRequest().getRequestURI()
        );
        errorResponse.setFieldErrors(ex.getFieldErrors());
        errorResponse.setCorrelationId(CorrelationIdUtil.getOrGenerateCorrelationId());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage(), "VALIDATION_ERROR"));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, WebRequest request) {
        log.warn("Validation error: {}", ex.getMessage());
        
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });
        
        ErrorResponse errorResponse = ErrorResponse.of(
                "Validation failed",
                "VALIDATION_ERROR",
                ((ServletWebRequest) request).getRequest().getRequestURI()
        );
        errorResponse.setFieldErrors(fieldErrors);
        errorResponse.setCorrelationId(CorrelationIdUtil.getOrGenerateCorrelationId());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Validation failed", "VALIDATION_ERROR"));
    }
    
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleConstraintViolation(
            ConstraintViolationException ex, WebRequest request) {
        log.warn("Constraint violation: {}", ex.getMessage());
        
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            fieldErrors.put(fieldName, errorMessage);
        });
        
        ErrorResponse errorResponse = ErrorResponse.of(
                "Constraint violation",
                "VALIDATION_ERROR",
                ((ServletWebRequest) request).getRequest().getRequestURI()
        );
        errorResponse.setFieldErrors(fieldErrors);
        errorResponse.setCorrelationId(CorrelationIdUtil.getOrGenerateCorrelationId());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Constraint violation", "VALIDATION_ERROR"));
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleAccessDenied(
            AccessDeniedException ex, WebRequest request) {
        log.warn("Access denied: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.of(
                "Access denied",
                "FORBIDDEN",
                ((ServletWebRequest) request).getRequest().getRequestURI()
        );
        errorResponse.setCorrelationId(CorrelationIdUtil.getOrGenerateCorrelationId());
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Access denied", "FORBIDDEN"));
    }
    
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleBadCredentials(
            BadCredentialsException ex, WebRequest request) {
        log.warn("Bad credentials: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.of(
                "Invalid credentials",
                "UNAUTHORIZED",
                ((ServletWebRequest) request).getRequest().getRequestURI()
        );
        errorResponse.setCorrelationId(CorrelationIdUtil.getOrGenerateCorrelationId());
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid credentials", "UNAUTHORIZED"));
    }
    
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, WebRequest request) {
        log.error("Data integrity violation: {}", ex.getMessage(), ex);
        
        String errorMessage = "Data integrity violation";
        String rootCause = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        
        // Provide more specific error messages
        if (rootCause != null) {
            if (rootCause.contains("username") || rootCause.contains("idx_user_username")) {
                errorMessage = "Username already exists";
            } else if (rootCause.contains("email") || rootCause.contains("idx_user_email")) {
                errorMessage = "Email already exists";
            } else if (rootCause.contains("role") || rootCause.contains("foreign key")) {
                errorMessage = "Invalid role specified. Valid roles are: Admin, Manager, Reviewer, Viewer";
            } else {
                errorMessage = "Data integrity violation: " + rootCause;
            }
        }
        
        ErrorResponse errorResponse = ErrorResponse.of(
                errorMessage,
                "DATA_ERROR",
                ((ServletWebRequest) request).getRequest().getRequestURI()
        );
        errorResponse.setCorrelationId(CorrelationIdUtil.getOrGenerateCorrelationId());
        
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(errorMessage, "DATA_ERROR"));
    }

    @ExceptionHandler(InvalidDataAccessApiUsageException.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleInvalidDataAccessApiUsageException(
            InvalidDataAccessApiUsageException ex, WebRequest request) {
        log.warn("Invalid data access usage: {}", ex.getMessage());
        
        String message = "Invalid request parameters";
        String details = ex.getMessage();
        
        if (details != null && (details.contains("UnknownPathException") || details.contains("Could not resolve attribute"))) {
            message = "Invalid sort parameter provided. Please check your request.";
        }
        
        ErrorResponse errorResponse = ErrorResponse.of(
                message,
                "INVALID_REQUEST",
                ((ServletWebRequest) request).getRequest().getRequestURI()
        );
        errorResponse.setCorrelationId(CorrelationIdUtil.getOrGenerateCorrelationId());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(message, "INVALID_REQUEST"));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<ErrorResponse>> handleGenericException(
            Exception ex, WebRequest request) {
        log.error("Unexpected error: ", ex);
        
        ErrorResponse errorResponse = ErrorResponse.of(
                "An unexpected error occurred",
                "INTERNAL_ERROR",
                ((ServletWebRequest) request).getRequest().getRequestURI()
        );
        errorResponse.setCorrelationId(CorrelationIdUtil.getOrGenerateCorrelationId());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred", "INTERNAL_ERROR"));
    }
}
