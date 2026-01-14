package com.company.platform.python.service;

import com.company.platform.python.client.PythonServiceClient;
import com.company.platform.python.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Service layer for Python service integration.
 * Provides business logic and error handling for Python service calls.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PythonServiceIntegrationService {
    
    private final PythonServiceClient pythonServiceClient;
    
    /**
     * Detect anomaly using Python service.
     */
    public AnomalyResponse detectAnomaly(AnomalyRequest request) {
        log.info("Detecting anomaly with metric: {}", request.getMetric());
        return pythonServiceClient.detectAnomaly(request);
    }
    
    /**
     * Evaluate risk using Python service.
     */
    public RiskResponse evaluateRisk(RiskRequest request) {
        log.info("Evaluating risk: amount={}, userScore={}", request.getAmount(), request.getUserScore());
        return pythonServiceClient.evaluateRisk(request);
    }
    
    /**
     * Evaluate decision using Python service.
     */
    public DecisionResponse evaluateDecision(DecisionRequest request) {
        log.info("Evaluating decision with score: {}", request.getScore());
        return pythonServiceClient.evaluateDecision(request);
    }
    
    /**
     * Process ingestion using Python service.
     */
    public IngestionResponse processIngestion(IngestionRequest request) {
        log.info("Processing ingestion from source: {}", request.getSource());
        return pythonServiceClient.processIngestion(request);
    }
    
    /**
     * Check Python service health.
     */
    public PythonHealthResponse checkHealth() {
        log.debug("Checking Python service health");
        return pythonServiceClient.checkHealth();
    }
}
