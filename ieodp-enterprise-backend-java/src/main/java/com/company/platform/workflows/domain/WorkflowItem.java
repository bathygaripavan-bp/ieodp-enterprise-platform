package com.company.platform.workflows.domain;

import com.company.platform.common.domain.BaseEntity;
import com.company.platform.users.domain.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Workflow item entity representing a business process item.
 * Implements state machine pattern for workflow management.
 */
@Entity
@Table(name = "workflow_items", indexes = {
    @Index(name = "idx_workflow_state", columnList = "state"),
    @Index(name = "idx_workflow_created_by", columnList = "created_by_id"),
    @Index(name = "idx_workflow_assigned_to", columnList = "assigned_to_id"),
    @Index(name = "idx_workflow_created_at", columnList = "created_at")
})
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowItem extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private WorkflowState state = WorkflowState.CREATED;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "created_by_id",
        referencedColumnName = "id",
        nullable = false,
        updatable = false,
        foreignKey = @ForeignKey(name = "fk_workflow_created_by_user")
    )
    private User createdBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "assigned_to_id",
        referencedColumnName = "id",
        foreignKey = @ForeignKey(name = "fk_workflow_assigned_to_user")
    )
    private User assignedTo;
    
    @Column(length = 500)
    private String comments;
    
    @Column(length = 50)
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL
    
    @Column(length = 100)
    private String category;
    
    /**
     * Business rule: Only certain state transitions are allowed.
     * This is enforced by the WorkflowEngine service.
     */
    public boolean canTransitionTo(WorkflowState newState) {
        return switch (this.state) {
            case CREATED -> newState == WorkflowState.REVIEWED;
            case REVIEWED -> newState == WorkflowState.APPROVED || 
                            newState == WorkflowState.REJECTED;
            case APPROVED -> newState == WorkflowState.REJECTED; // Can be rejected even after approval
            case REJECTED -> newState == WorkflowState.REOPENED;
            case REOPENED -> newState == WorkflowState.CREATED; // Back to created after reopening
        };
    }
}
