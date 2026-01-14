package com.company.platform.python.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration for RestTemplate used to call Python service.
 */
@Configuration
public class RestTemplateConfig {
    
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder, PythonServiceConfig pythonServiceConfig) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(pythonServiceConfig.getConnectTimeout());
        factory.setReadTimeout(pythonServiceConfig.getReadTimeout());
        
        return builder
                .requestFactory(() -> factory)
                .build();
    }
}
