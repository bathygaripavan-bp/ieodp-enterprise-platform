package com.company.platform.python.client;

import com.company.platform.common.exception.BusinessException;
import com.company.platform.python.config.PythonServiceConfig;
import com.company.platform.python.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

/**
 * HTTP client for calling Python service endpoints.
 * Handles all communication with Python FastAPI service.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PythonServiceClient {
    
    private final RestTemplate restTemplate;
    private final PythonServiceConfig pythonServiceConfig;
    
    /**
     * Call Python anomaly detection endpoint.
     * POST /anomaly/detect
     */
    public AnomalyResponse detectAnomaly(AnomalyRequest request) {
        String url = pythonServiceConfig.getBaseUrl() + "/anomaly/detect";
        log.info("Calling Python anomaly detection service: {}", url);
        
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<AnomalyRequest> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<AnomalyResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    AnomalyResponse.class
            );
            
            log.info("Python anomaly detection successful");
            return response.getBody();
            
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Python anomaly detection failed: status={}, body={}", 
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException("Python anomaly detection service error: " + e.getMessage());
        } catch (ResourceAccessException e) {
            log.error("Python anomaly detection service unavailable: {}", e.getMessage());
            throw new BusinessException("Python anomaly detection service unavailable");
        }
    }
    
    /**
     * Call Python risk evaluation endpoint.
     * POST /risk/evaluate
     */
    public RiskResponse evaluateRisk(RiskRequest request) {
        String url = pythonServiceConfig.getBaseUrl() + "/risk/evaluate";
        log.info("Calling Python risk evaluation service: {}", url);
        
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<RiskRequest> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<RiskResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    RiskResponse.class
            );
            
            log.info("Python risk evaluation successful");
            return response.getBody();
            
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Python risk evaluation failed: status={}, body={}", 
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException("Python risk evaluation service error: " + e.getMessage());
        } catch (ResourceAccessException e) {
            log.error("Python risk evaluation service unavailable: {}", e.getMessage());
            throw new BusinessException("Python risk evaluation service unavailable");
        }
    }
    
    /**
     * Call Python decision support endpoint.
     * POST /decision/evaluate
     */
    public DecisionResponse evaluateDecision(DecisionRequest request) {
        String url = pythonServiceConfig.getBaseUrl() + "/decision/evaluate";
        log.info("Calling Python decision support service: {}", url);
        
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<DecisionRequest> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<DecisionResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    DecisionResponse.class
            );
            
            log.info("Python decision evaluation successful");
            return response.getBody();
            
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Python decision evaluation failed: status={}, body={}", 
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException("Python decision support service error: " + e.getMessage());
        } catch (ResourceAccessException e) {
            log.error("Python decision support service unavailable: {}", e.getMessage());
            throw new BusinessException("Python decision support service unavailable");
        }
    }
    
    /**
     * Call Python ingestion endpoint.
     * POST /ingestion/process
     */
    public IngestionResponse processIngestion(IngestionRequest request) {
        String url = pythonServiceConfig.getBaseUrl() + "/ingestion/process";
        log.info("Calling Python ingestion service: {}", url);
        
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<IngestionRequest> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<IngestionResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    IngestionResponse.class
            );
            
            log.info("Python ingestion successful");
            return response.getBody();
            
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Python ingestion failed: status={}, body={}", 
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException("Python ingestion service error: " + e.getMessage());
        } catch (ResourceAccessException e) {
            log.error("Python ingestion service unavailable: {}", e.getMessage());
            throw new BusinessException("Python ingestion service unavailable");
        }
    }
    
    /**
     * Call Python health check endpoint.
     * GET /health/health
     */
    public PythonHealthResponse checkHealth() {
        String url = pythonServiceConfig.getBaseUrl() + "/health/health";
        log.debug("Calling Python health check service: {}", url);
        
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            ResponseEntity<PythonHealthResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    PythonHealthResponse.class
            );
            
            log.debug("Python health check successful");
            return response.getBody();
            
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Python health check failed: status={}, body={}", 
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException("Python health check service error: " + e.getMessage());
        } catch (ResourceAccessException e) {
            log.error("Python health check service unavailable: {}", e.getMessage());
            throw new BusinessException("Python health check service unavailable");
        }
    }
    
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Source-System", "java-backend");
        return headers;
    }
}
