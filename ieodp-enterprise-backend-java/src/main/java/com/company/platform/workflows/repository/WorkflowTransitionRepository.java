package com.company.platform.workflows.repository;

import com.company.platform.workflows.domain.WorkflowAction;
import com.company.platform.workflows.domain.WorkflowState;
import com.company.platform.workflows.domain.WorkflowTransition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for WorkflowTransition entity.
 */
@Repository
public interface WorkflowTransitionRepository extends JpaRepository<WorkflowTransition, Long> {
    
    Optional<WorkflowTransition> findByFromStateAndAction(WorkflowState fromState, WorkflowAction action);
    
    @Query("SELECT wt FROM WorkflowTransition wt " +
           "LEFT JOIN FETCH wt.allowedRole " +
           "WHERE wt.fromState = :fromState")
    List<WorkflowTransition> findByFromState(@Param("fromState") WorkflowState fromState);
    
    @Query("SELECT wt FROM WorkflowTransition wt " +
           "LEFT JOIN FETCH wt.allowedRole " +
           "WHERE wt.fromState = :fromState AND wt.allowedRole.name = :roleName")
    List<WorkflowTransition> findByFromStateAndRole(@Param("fromState") WorkflowState fromState, 
                                                      @Param("roleName") String roleName);
}
