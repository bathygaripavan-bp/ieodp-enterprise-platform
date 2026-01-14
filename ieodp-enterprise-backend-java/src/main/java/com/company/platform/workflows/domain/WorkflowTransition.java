package com.company.platform.workflows.domain;

import com.company.platform.common.domain.BaseEntity;
import com.company.platform.users.domain.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Workflow transition entity defining allowed state transitions.
 * Enforces business rules for workflow state machine.
 */
@Entity
@Table(name = "workflow_transitions", indexes = {
    @Index(name = "idx_transition_from_action", columnList = "from_state,action"),
    @Index(name = "idx_transition_role", columnList = "allowed_role_id")
})
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTransition extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "from_state", nullable = false, length = 20)
    private WorkflowState fromState;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "to_state", nullable = false, length = 20)
    private WorkflowState toState;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkflowAction action;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "allowed_role_id", nullable = false)
    private Role allowedRole;
    
    @Column(length = 255)
    private String description;
}
