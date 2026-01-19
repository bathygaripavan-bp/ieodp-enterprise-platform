package com.company.platform.python.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for Python service integration.
 */
@Configuration
@ConfigurationProperties(prefix = "python.service")
@Data
public class PythonServiceConfig {
    /**
     * Base URL of the Python service (e.g., http://localhost:8000)
     */
    //private String baseUrl = " http://localhost:8000";
    private String baseUrl = "http://18.204.221.219:8000";
    
    /**
     * Connection timeout in milliseconds
     */
    private int connectTimeout = 5000;
    
    /**
     * Read timeout in milliseconds
     */
    private int readTimeout = 10000;
}
