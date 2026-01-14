package com.company.platform.audit.repository;

import com.company.platform.audit.domain.AuditAction;
import com.company.platform.audit.domain.AuditLog;
import com.company.platform.users.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/**
 * Repository for AuditLog entity.
 * Provides optimized queries for audit trail retrieval.
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    @Query("SELECT a FROM AuditLog a " +
           "LEFT JOIN FETCH a.performedBy " +
           "WHERE a.action = :action")
    Page<AuditLog> findByAction(@Param("action") AuditAction action, Pageable pageable);
    
    @Query("SELECT a FROM AuditLog a " +
           "LEFT JOIN FETCH a.performedBy " +
           "WHERE a.performedBy = :user")
    Page<AuditLog> findByUser(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT a FROM AuditLog a " +
           "LEFT JOIN FETCH a.performedBy " +
           "WHERE a.entityType = :entityType AND a.entityId = :entityId")
    Page<AuditLog> findByEntity(@Param("entityType") String entityType, 
                                @Param("entityId") Long entityId, 
                                Pageable pageable);
    
    @Query("SELECT a FROM AuditLog a " +
           "LEFT JOIN FETCH a.performedBy " +
           "WHERE (:action IS NULL OR a.action = :action) AND " +
           "(:entityType IS NULL OR a.entityType = :entityType) AND " +
           "(:entityId IS NULL OR a.entityId = :entityId) AND " +
           "(:userId IS NULL OR a.performedBy.id = :userId) AND " +
           "(:fromDate IS NULL OR a.createdAt >= :fromDate) AND " +
           "(:toDate IS NULL OR a.createdAt <= :toDate) AND " +
           "(:correlationId IS NULL OR a.correlationId = :correlationId)")
    Page<AuditLog> searchAuditLogs(
        @Param("action") AuditAction action,
        @Param("entityType") String entityType,
        @Param("entityId") Long entityId,
        @Param("userId") Long userId,
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate,
        @Param("correlationId") String correlationId,
        Pageable pageable
    );
}
