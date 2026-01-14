package com.company.platform.workflows.service;

import com.company.platform.common.exception.ForbiddenException;
import com.company.platform.common.exception.WorkflowException;
import com.company.platform.users.domain.User;
import com.company.platform.workflows.domain.WorkflowAction;
import com.company.platform.workflows.domain.WorkflowItem;
import com.company.platform.workflows.domain.WorkflowState;
import com.company.platform.workflows.domain.WorkflowTransition;
import com.company.platform.workflows.repository.WorkflowTransitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Workflow engine implementing state machine logic.
 * Validates state transitions based on business rules and user roles.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WorkflowEngine {
    
    private final WorkflowTransitionRepository transitionRepository;
    
    /**
     * Process workflow state transition.
     * Validates role permissions and business rules before transitioning.
     * 
     * @param item Workflow item to transition
     * @param action Action to perform
     * @param user User performing the action
     * @return New workflow state
     * @throws WorkflowException if transition is invalid
     * @throws ForbiddenException if user lacks permission
     */
    public WorkflowState processTransition(WorkflowItem item, WorkflowAction action, User user) {
        log.info("Processing workflow transition: item={}, action={}, user={}", 
                item.getId(), action, user.getUsername());
        
        // Validate user role can perform this action from current state
        if (!canUserPerformAction(item.getState(), action, user)) {
            throw new ForbiddenException(
                    String.format("User %s with role %s cannot perform %s from state %s",
                            user.getUsername(), user.getRole().getName(), action, item.getState())
            );
        }
        
        // Find valid transition
        WorkflowTransition transition = transitionRepository
                .findByFromStateAndAction(item.getState(), action)
                .orElseThrow(() -> new WorkflowException(
                        String.format("Invalid transition: %s from state %s", action, item.getState())
                ));
        
        // Validate business rule
        if (!item.canTransitionTo(transition.getToState())) {
            throw new WorkflowException(
                    String.format("Business rule violation: Cannot transition from %s to %s",
                            item.getState(), transition.getToState())
            );
        }
        
        log.info("Workflow transition approved: {} -> {}", item.getState(), transition.getToState());
        return transition.getToState();
    }
    
    /**
     * Check if user can perform action from current state.
     * Validates role-based permissions.
     */
    private boolean canUserPerformAction(WorkflowState currentState, WorkflowAction action, User user) {
        List<WorkflowTransition> allowedTransitions = transitionRepository
                .findByFromStateAndRole(currentState, user.getRole().getName());
        
        return allowedTransitions.stream()
                .anyMatch(transition -> transition.getAction() == action);
    }
    
    /**
     * Get all allowed actions for a user from current state.
     */
    public List<WorkflowAction> getAllowedActions(WorkflowItem item, User user) {
        List<WorkflowTransition> transitions = transitionRepository
                .findByFromStateAndRole(item.getState(), user.getRole().getName());
        
        return transitions.stream()
                .map(WorkflowTransition::getAction)
                .distinct()
                .toList();
    }
}
