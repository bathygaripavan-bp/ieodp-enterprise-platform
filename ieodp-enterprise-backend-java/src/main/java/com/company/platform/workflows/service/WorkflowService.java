package com.company.platform.workflows.service;

import com.company.platform.audit.domain.AuditAction;
import com.company.platform.audit.service.AuditService;
import com.company.platform.common.exception.ForbiddenException;
import com.company.platform.common.exception.NotFoundException;
import com.company.platform.users.domain.User;
import com.company.platform.users.repository.UserRepository;
import com.company.platform.workflows.domain.WorkflowAction;
import com.company.platform.workflows.domain.WorkflowItem;
import com.company.platform.workflows.domain.WorkflowState;
import com.company.platform.workflows.dto.WorkflowCreateRequest;
import com.company.platform.workflows.dto.WorkflowResponse;
import com.company.platform.workflows.dto.WorkflowTransitionRequest;
import com.company.platform.workflows.dto.WorkflowUpdateRequest;
import com.company.platform.workflows.repository.WorkflowItemRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowService {

    private final WorkflowItemRepository workflowRepository;
    private final UserRepository userRepository;
    private final WorkflowEngine workflowEngine;
    private final AuditService auditService;

    // ------------------------------------------------------------
    // CREATE WORKFLOW  (Admin + Manager)
    // ------------------------------------------------------------
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public WorkflowResponse createWorkflow(WorkflowCreateRequest request, User currentUser) throws JsonProcessingException {

        log.info("Creating workflow: title={}, user={}", request.getTitle(), currentUser.getUsername());

        WorkflowItem workflow = WorkflowItem.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .category(request.getCategory())
                .state(WorkflowState.CREATED)
                .createdBy(currentUser)
                .assignedTo(request.getAssignedToId() != null ?
                        userRepository.findById(request.getAssignedToId()).orElse(null) : null)
                .build();

        workflow = workflowRepository.save(workflow);

        auditService.logAction(
                AuditAction.WORKFLOW_CREATED,
                "WorkflowItem",
                workflow.getId(),
                "Workflow created",
                currentUser,
                null,
                null
        );

        return toDTO(workflow);
    }


    // ------------------------------------------------------------
    // GET WORKFLOW BY ID (Admin + Manager + Reviewer + Viewer)
    // Viewers can only access workflows assigned to them
    // ------------------------------------------------------------
    @Transactional(readOnly = true)
    public WorkflowResponse getWorkflowById(Long id, User currentUser) {

        WorkflowItem workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Workflow not found: " + id));

        String roleName = currentUser.getRole().getName();
        if ("VIEWER".equalsIgnoreCase(roleName)) {
            if (workflow.getAssignedTo() == null ||
                    !workflow.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("Viewers can only access workflows assigned to them");
            }
        }

        return toDTO(workflow);
    }


    // ------------------------------------------------------------
    // GET ALL WORKFLOWS
    // Admin + Manager + Reviewer -> all
    // Viewer -> only workflows assigned to the viewer
    // ------------------------------------------------------------
    @Transactional(readOnly = true)
    public Page<WorkflowResponse> getAllWorkflows(Pageable pageable, User currentUser) {

        String roleName = currentUser.getRole().getName();
        log.info("Fetching workflows for user={} with role={}", currentUser.getUsername(), roleName);

        if ("VIEWER".equalsIgnoreCase(roleName) || "REVIEWER".equalsIgnoreCase(roleName)) {
            // Viewers and Reviewers only see workflows assigned to them
            return workflowRepository.findByAssignedTo(currentUser, pageable)
                    .map(this::toDTO);
        }

        // Admin, Manager, Reviewer see all workflows
        return workflowRepository.findAll(pageable)
                .map(this::toDTO);
    }


    // ------------------------------------------------------------
    // SEARCH WORKFLOWS (Admin + Manager + Reviewer)
    // ------------------------------------------------------------
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'REVIEWER')")
    public Page<WorkflowResponse> searchWorkflows(
            WorkflowState state,
            String search,
            java.time.LocalDateTime fromDate,
            java.time.LocalDateTime toDate,
            Pageable pageable) {

        return workflowRepository
                .searchWorkflows(state, search, fromDate, toDate, pageable)
                .map(this::toDTO);
    }


    // ------------------------------------------------------------
    // UPDATE WORKFLOW (Admin + Manager)
    // ------------------------------------------------------------
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public WorkflowResponse updateWorkflow(Long id, WorkflowUpdateRequest request, User currentUser) throws JsonProcessingException {

        WorkflowItem workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Workflow not found: " + id));

        if (workflow.getState() == WorkflowState.CREATED) {
            if (!workflow.getCreatedBy().getId().equals(currentUser.getId()) &&
                    (workflow.getAssignedTo() == null ||
                            !workflow.getAssignedTo().getId().equals(currentUser.getId()))) {
                throw new ForbiddenException("Only creator or assigned user can update workflow in CREATED state");
            }
        }

        Map<String, String> oldValues = new HashMap<>();
        Map<String, String> newValues = new HashMap<>();

        if (request.getTitle() != null && !request.getTitle().equals(workflow.getTitle())) {
            oldValues.put("title", workflow.getTitle());
            newValues.put("title", request.getTitle());
            workflow.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            oldValues.put("description", workflow.getDescription());
            newValues.put("description", request.getDescription());
            workflow.setDescription(request.getDescription());
        }

        if (request.getPriority() != null) {
            oldValues.put("priority", workflow.getPriority());
            newValues.put("priority", request.getPriority());
            workflow.setPriority(request.getPriority());
        }

        if (request.getAssignedToId() != null) {
            User assignedTo = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new NotFoundException("User not found: " + request.getAssignedToId()));
            oldValues.put("assignedTo", workflow.getAssignedTo() != null ? workflow.getAssignedTo().getUsername() : null);
            newValues.put("assignedTo", assignedTo.getUsername());
            workflow.setAssignedTo(assignedTo);
        }

        workflow = workflowRepository.save(workflow);

        auditService.logAction(
                AuditAction.WORKFLOW_UPDATED,
                "WorkflowItem",
                workflow.getId(),
                "Workflow updated",
                currentUser,
                oldValues.isEmpty() ? null : oldValues,
                newValues.isEmpty() ? null : newValues
        );

        return toDTO(workflow);
    }


    // ------------------------------------------------------------
    // TRANSITION WORKFLOW (Admin + Reviewer)
    // ------------------------------------------------------------
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'REVIEWER')")
    public WorkflowResponse transitionWorkflow(Long id, WorkflowTransitionRequest request, User currentUser) throws JsonProcessingException {

        WorkflowItem workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Workflow not found: " + id));

        WorkflowState newState = workflowEngine.processTransition(workflow, request.getAction(), currentUser);

        workflow.setState(newState);

        workflow = workflowRepository.save(workflow);

        auditService.logAction(
                AuditAction.WORKFLOW_UPDATED,
                "WorkflowItem",
                workflow.getId(),
                "Workflow transitioned",
                currentUser,
                Map.of("oldState", workflow.getState().name()),
                Map.of("newState", newState.name())
        );

        return toDTO(workflow);
    }


    // ------------------------------------------------------------
    // DELETE WORKFLOW (Admin only)
    // ------------------------------------------------------------
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteWorkflow(Long id, User currentUser) throws JsonProcessingException {

        WorkflowItem workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Workflow not found: " + id));

        workflowRepository.delete(workflow);

        auditService.logAction(
                AuditAction.WORKFLOW_DELETED,
                "WorkflowItem",
                id,
                "Workflow deleted",
                currentUser,
                null,
                null
        );
    }


    // Convert to DTO
    private WorkflowResponse toDTO(WorkflowItem workflow) {
        return WorkflowResponse.builder()
                .id(workflow.getId())
                .title(workflow.getTitle())
                .description(workflow.getDescription())
                .priority(workflow.getPriority())
                .state(workflow.getState())
                .category(workflow.getCategory())
                .assignedToId(workflow.getAssignedTo() != null ? workflow.getAssignedTo().getId() : null)
                .assignedToUsername(workflow.getAssignedTo() != null ? workflow.getAssignedTo().getUsername() : null)
                .createdById(workflow.getCreatedBy().getId())
                .createdByUsername(workflow.getCreatedBy().getUsername())
                .createdAt(workflow.getCreatedAt())
                .updatedAt(workflow.getUpdatedAt())
                .build();
    }
}
