package com.company.platform.common.exception;

/**
 * Exception for workflow state transition violations.
 */
public class WorkflowException extends BusinessException {
    public WorkflowException(String message) {
        super(message, "WORKFLOW_ERROR");
    }
}
