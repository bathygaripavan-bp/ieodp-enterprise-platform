package com.company.platform.config;

import com.company.platform.common.interceptor.ApiVersionInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * Web configuration for API versioning and interceptors.
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {
    
    private final ApiVersionInterceptor apiVersionInterceptor;

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:*,http://18.204.221.219,http://18.204.221.219:80,http://184.72.113.212,http://184.72.113.212:80}")
    private List<String> allowedOrigins;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(apiVersionInterceptor)
                .addPathPatterns("/api/**");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(allowedOrigins.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "X-Correlation-ID", "X-API-Version", "X-Deprecated", "Sunset")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
