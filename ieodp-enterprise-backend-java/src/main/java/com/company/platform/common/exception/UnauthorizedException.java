package com.company.platform.common.exception;

/**
 * Exception for authentication failures.
 */
public class UnauthorizedException extends BusinessException {
    public UnauthorizedException(String message) {
        super(message, "UNAUTHORIZED");
    }
}
