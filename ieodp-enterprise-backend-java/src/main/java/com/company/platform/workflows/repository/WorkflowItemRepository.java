package com.company.platform.workflows.repository;

import com.company.platform.users.domain.User;
import com.company.platform.workflows.domain.WorkflowItem;
import com.company.platform.workflows.domain.WorkflowState;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository for WorkflowItem entity.
 * Provides optimized queries with proper indexing to avoid N+1 issues.
 */
@Repository
public interface WorkflowItemRepository extends JpaRepository<WorkflowItem, Long> {
    
    @Query("SELECT w FROM WorkflowItem w " +
           "LEFT JOIN FETCH w.createdBy " +
           "LEFT JOIN FETCH w.assignedTo " +
           "WHERE w.id = :id")
    Optional<WorkflowItem> findById(@Param("id") Long id);
    
    @Query("SELECT w FROM WorkflowItem w " +
           "LEFT JOIN FETCH w.createdBy " +
           "LEFT JOIN FETCH w.assignedTo " +
           "WHERE w.state = :state")
    Page<WorkflowItem> findByState(@Param("state") WorkflowState state, Pageable pageable);
    
    @Query("SELECT w FROM WorkflowItem w " +
           "LEFT JOIN FETCH w.createdBy " +
           "LEFT JOIN FETCH w.assignedTo " +
           "WHERE w.createdBy = :user")
    Page<WorkflowItem> findByCreatedBy(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT w FROM WorkflowItem w " +
           "LEFT JOIN FETCH w.createdBy " +
           "LEFT JOIN FETCH w.assignedTo " +
           "WHERE w.assignedTo = :user")
    Page<WorkflowItem> findByAssignedTo(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT w FROM WorkflowItem w " +
           "LEFT JOIN FETCH w.createdBy " +
           "LEFT JOIN FETCH w.assignedTo " +
           "WHERE (:state IS NULL OR w.state = :state) AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(w.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(w.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:fromDate IS NULL OR w.createdAt >= :fromDate) AND " +
           "(:toDate IS NULL OR w.createdAt <= :toDate)")
    Page<WorkflowItem> searchWorkflows(
        @Param("state") WorkflowState state,
        @Param("search") String search,
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate,
        Pageable pageable
    );
}
