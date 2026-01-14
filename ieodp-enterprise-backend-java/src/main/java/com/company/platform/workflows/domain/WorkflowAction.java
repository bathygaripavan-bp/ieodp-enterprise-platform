package com.company.platform.workflows.domain;

/**
 * Workflow action enumeration.
 * Defines the actions that can trigger state transitions.
 */
public enum WorkflowAction {
    SUBMIT,    // CREATED -> REVIEWED
    REVIEW,    // CREATED -> REVIEWED (alternative)
    APPROVE,   // REVIEWED -> APPROVED
    REJECT,    // REVIEWED -> REJECTED or APPROVED -> REJECTED
    REOPEN     // REJECTED -> REOPENED -> CREATED
}
