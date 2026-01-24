package com.company.platform.python.controller;

import com.company.platform.common.response.ApiResponse;
import com.company.platform.python.dto.*;
import com.company.platform.python.service.PythonServiceIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Python service integration endpoints.
 * Exposes Java endpoints that call Python FastAPI service.
 * 
 * All endpoints are versioned under /api/v1/python/**
 */
@RestController
@RequestMapping("/api/v1/python")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Python Service Integration", description = "Endpoints for Python service integration")
@SecurityRequirement(name = "bearerAuth")
public class PythonServiceController {
    
    private final PythonServiceIntegrationService pythonServiceIntegrationService;
    
    /**
     * Anomaly detection endpoint.
     * Calls Python service: POST /anomaly/detect
     */
    @PostMapping("/anomaly/detect")
    @Operation(
            summary = "Detect anomaly",
            description = "Calls Python anomaly detection service to detect anomalies in metrics"
    )
    public ResponseEntity<ApiResponse<AnomalyResponse>> detectAnomaly(
            @Valid @RequestBody AnomalyRequest request) {
        log.info("Anomaly detection request: metric={}", request.getMetric());
        AnomalyResponse response = pythonServiceIntegrationService.detectAnomaly(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Anomaly detection completed"));
    }
    
    /**
     * Risk evaluation endpoint.
     * Calls Python service: POST /risk/evaluate
     */
    @PostMapping("/risk/evaluate")
    @Operation(
            summary = "Evaluate risk",
            description = "Calls Python risk evaluation service to evaluate transaction risk"
    )
    public ResponseEntity<ApiResponse<RiskResponse>> evaluateRisk(
            @Valid @RequestBody RiskRequest request) {
        log.info("Risk evaluation request: amount={}, userScore={}", 
                request.getAmount(), request.getUserScore());
        RiskResponse response = pythonServiceIntegrationService.evaluateRisk(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Risk evaluation completed"));
    }
    
    /**
     * Decision support endpoint.
     * Calls Python service: POST /decision/evaluate
     */
    @PostMapping("/decision/evaluate")
    @Operation(
            summary = "Evaluate decision",
            description = "Calls Python decision support service to evaluate decisions based on score"
    )
    public ResponseEntity<ApiResponse<DecisionResponse>> evaluateDecision(
            @Valid @RequestBody DecisionRequest request) {
        log.info("Decision evaluation request: score={}", request.getScore());
        DecisionResponse response = pythonServiceIntegrationService.evaluateDecision(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Decision evaluation completed"));
    }
    
    /**
     * Ingestion processing endpoint.
     * Calls Python service: POST /ingestion/process
     */
    @PostMapping("/ingestion/process")
    @Operation(
            summary = "Process ingestion",
            description = "Calls Python ingestion service to process data ingestion"
    )
    public ResponseEntity<ApiResponse<IngestionResponse>> processIngestion(
            @Valid @RequestBody IngestionRequest request) {
        log.info("Ingestion request: source={}", request.getSource());
        IngestionResponse response = pythonServiceIntegrationService.processIngestion(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Ingestion processed successfully"));
    }
    
    /**
     * Health check endpoint.
     * Calls Python service: GET /health/health
     */
    @GetMapping("/health")
    @Operation(
            summary = "Python service health check",
            description = "Checks the health status of the Python service"
    )
    public ResponseEntity<ApiResponse<PythonHealthResponse>> checkHealth() {
        log.debug("Python service health check requested");
        PythonHealthResponse response = pythonServiceIntegrationService.checkHealth();
        return ResponseEntity.ok(ApiResponse.success(response, "Python service health check completed"));
    }
}
