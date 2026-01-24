package com.company.platform.workflows.domain;

/**
 * Workflow state enumeration.
 * Defines the possible states in the workflow state machine.
 */
public enum WorkflowState {
    CREATED,
    REVIEWED,
    APPROVED,
    REJECTED,
    REOPENED
}
