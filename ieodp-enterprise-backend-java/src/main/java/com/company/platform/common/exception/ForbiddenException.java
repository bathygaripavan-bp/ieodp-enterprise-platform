package com.company.platform.common.exception;

/**
 * Exception for authorization failures (insufficient permissions).
 */
public class ForbiddenException extends BusinessException {
    public ForbiddenException(String message) {
        super(message, "FORBIDDEN");
    }
}
