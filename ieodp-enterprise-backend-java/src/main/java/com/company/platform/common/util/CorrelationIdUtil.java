package com.company.platform.common.util;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.MDC;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

/**
 * Utility for managing correlation IDs across request lifecycle.
 * Enables request tracing and log correlation in distributed systems.
 */
public class CorrelationIdUtil {
    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String MDC_CORRELATION_ID = "correlationId";
    
    /**
     * Get or generate correlation ID from request.
     * Checks header first, then MDC, then generates new one.
     */
    public static String getOrGenerateCorrelationId() {
        ServletRequestAttributes attributes = 
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String correlationId = request.getHeader(CORRELATION_ID_HEADER);
            
            if (correlationId == null || correlationId.isEmpty()) {
                correlationId = MDC.get(MDC_CORRELATION_ID);
            }
            
            if (correlationId == null || correlationId.isEmpty()) {
                correlationId = UUID.randomUUID().toString();
            }
            
            MDC.put(MDC_CORRELATION_ID, correlationId);
            return correlationId;
        }
        
        String correlationId = MDC.get(MDC_CORRELATION_ID);
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
            MDC.put(MDC_CORRELATION_ID, correlationId);
        }
        return correlationId;
    }
    
    public static void setCorrelationId(String correlationId) {
        MDC.put(MDC_CORRELATION_ID, correlationId);
    }
    
    public static void clearCorrelationId() {
        MDC.remove(MDC_CORRELATION_ID);
    }
}
