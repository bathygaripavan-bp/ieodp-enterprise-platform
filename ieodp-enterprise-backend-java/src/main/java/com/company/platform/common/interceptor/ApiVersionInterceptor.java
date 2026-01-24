package com.company.platform.common.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor for API versioning and deprecation headers.
 * Adds version headers to all API responses for backward compatibility tracking.
 */
@Component
@Slf4j
public class ApiVersionInterceptor implements HandlerInterceptor {
    
    private static final String API_VERSION_HEADER = "X-API-Version";
    private static final String DEPRECATION_HEADER = "X-Deprecated";
    private static final String SUNSET_HEADER = "Sunset";
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String requestPath = request.getRequestURI();
        
        // Add API version header for all /api/v1/** endpoints
        if (requestPath.startsWith("/api/v1/")) {
            response.setHeader(API_VERSION_HEADER, "v1");
            response.setHeader(DEPRECATION_HEADER, "false");
        }
        
        // Future: Add deprecation warnings for v1 endpoints when v2 is released
        // Example:
        // if (requestPath.startsWith("/api/v1/") && isDeprecated(requestPath)) {
        //     response.setHeader(DEPRECATION_HEADER, "true");
        //     response.setHeader(SUNSET_HEADER, "2025-12-31");
        // }
        
        return true;
    }
}
