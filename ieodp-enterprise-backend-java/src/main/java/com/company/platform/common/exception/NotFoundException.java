package com.company.platform.common.exception;

/**
 * Exception thrown when a requested resource is not found.
 */
public class NotFoundException extends BusinessException {
    public NotFoundException(String message) {
        super(message, "RESOURCE_NOT_FOUND");
    }
}
