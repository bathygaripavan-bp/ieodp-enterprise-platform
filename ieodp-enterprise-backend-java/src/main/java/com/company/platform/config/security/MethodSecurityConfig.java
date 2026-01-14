package com.company.platform.config.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.io.Serializable;
import java.util.Collection;

/**
 * Method security configuration for permission-based access control.
 * Enables hasPermission() expressions in @PreAuthorize annotations.
 */
@Configuration
@RequiredArgsConstructor
public class MethodSecurityConfig {
    
    /**
     * Custom permission evaluator for checking user permissions.
     * This enables hasPermission() expressions in @PreAuthorize annotations.
     */
    @Bean
    public MethodSecurityExpressionHandler methodSecurityExpressionHandler() {
        DefaultMethodSecurityExpressionHandler handler = new DefaultMethodSecurityExpressionHandler();
        handler.setPermissionEvaluator(new CustomPermissionEvaluator());
        return handler;
    }
    
    /**
     * Custom permission evaluator implementation.
     * Checks if the authenticated user has the required permission.
     */
    public static class CustomPermissionEvaluator implements org.springframework.security.access.PermissionEvaluator {
        
        @Override
        public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
            if (authentication == null || permission == null) {
                return false;
            }
            
            String permissionName = permission.toString();
            Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
            
            // Check if user has the required permission
            return authorities.stream()
                    .anyMatch(authority -> authority.getAuthority().equals(permissionName));
        }
        
        @Override
        public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
            return hasPermission(authentication, null, permission);
        }
    }
}
