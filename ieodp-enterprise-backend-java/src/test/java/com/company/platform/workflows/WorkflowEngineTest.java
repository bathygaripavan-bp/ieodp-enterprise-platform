package com.company.platform.workflows;

import com.company.platform.common.exception.ForbiddenException;
import com.company.platform.common.exception.WorkflowException;
import com.company.platform.users.domain.Role;
import com.company.platform.users.domain.User;
import com.company.platform.workflows.service.WorkflowEngine;
import com.company.platform.workflows.domain.WorkflowAction;
import com.company.platform.workflows.domain.WorkflowItem;
import com.company.platform.workflows.domain.WorkflowState;
import com.company.platform.workflows.domain.WorkflowTransition;
import com.company.platform.workflows.repository.WorkflowTransitionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for WorkflowEngine.
 */
@ExtendWith(MockitoExtension.class)
class WorkflowEngineTest {
    
    @Mock
    private WorkflowTransitionRepository transitionRepository;
    
    @InjectMocks
    private WorkflowEngine workflowEngine;
    
    private User testUser;
    private Role testRole;
    private WorkflowItem workflowItem;
    private WorkflowTransition transition;
    
    @BeforeEach
    void setUp() {
        testRole = Role.builder()
                .id(1L)
                .name("Manager")
                .build();
        
        testUser = User.builder()
                .id(1L)
                .username("manager")
                .role(testRole)
                .build();
        
        workflowItem = WorkflowItem.builder()
                .id(1L)
                .title("Test Workflow")
                .state(WorkflowState.REVIEWED)
                .build();
        
        transition = WorkflowTransition.builder()
                .id(1L)
                .fromState(WorkflowState.REVIEWED)
                .toState(WorkflowState.APPROVED)
                .action(WorkflowAction.APPROVE)
                .allowedRole(testRole)
                .build();
    }
    
    @Test
    void testProcessTransition_Success() {
        when(transitionRepository.findByFromStateAndRole(any(WorkflowState.class), anyString()))
                .thenReturn(List.of(transition));
        when(transitionRepository.findByFromStateAndAction(any(WorkflowState.class), any(WorkflowAction.class)))
                .thenReturn(Optional.of(transition));
        
        WorkflowState newState = workflowEngine.processTransition(workflowItem, WorkflowAction.APPROVE, testUser);
        
        assertEquals(WorkflowState.APPROVED, newState);
        verify(transitionRepository).findByFromStateAndAction(WorkflowState.REVIEWED, WorkflowAction.APPROVE);
    }
    
    @Test
    void testProcessTransition_InvalidTransition() {
        when(transitionRepository.findByFromStateAndRole(any(WorkflowState.class), anyString()))
                .thenReturn(List.of());
        
        assertThrows(ForbiddenException.class, () -> 
                workflowEngine.processTransition(workflowItem, WorkflowAction.APPROVE, testUser));
    }
    
    @Test
    void testProcessTransition_TransitionNotFound() {
        when(transitionRepository.findByFromStateAndRole(any(WorkflowState.class), anyString()))
                .thenReturn(List.of(transition));
        when(transitionRepository.findByFromStateAndAction(any(WorkflowState.class), any(WorkflowAction.class)))
                .thenReturn(Optional.empty());
        
        assertThrows(WorkflowException.class, () -> 
                workflowEngine.processTransition(workflowItem, WorkflowAction.APPROVE, testUser));
    }
}
