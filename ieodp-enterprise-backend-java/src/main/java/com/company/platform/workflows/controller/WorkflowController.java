package com.company.platform.workflows.controller;

import com.company.platform.common.response.ApiResponse;
import com.company.platform.users.domain.User;
import com.company.platform.workflows.domain.WorkflowState;
import com.company.platform.workflows.dto.*;
import com.company.platform.workflows.service.WorkflowIntegrationService;
import com.company.platform.workflows.service.WorkflowService;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/workflows")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Workflows")
@SecurityRequirement(name = "bearerAuth")
public class WorkflowController {

    private final WorkflowService workflowService;
    private final WorkflowIntegrationService workflowIntegrationService;

    // -------------------------------
    // CREATE WORKFLOW
    // Admin + Manager
    // -------------------------------
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<WorkflowResponse>> createWorkflow(
            @Valid @RequestBody WorkflowCreateRequest request,
            @AuthenticationPrincipal User currentUser) throws JsonProcessingException {

        WorkflowResponse response = workflowService.createWorkflow(request, currentUser);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Workflow created successfully"));
    }

    // -------------------------------
    // GET WORKFLOW BY ID
    // Admin + Manager + Reviewer + Viewer
    // Viewers can only see workflows assigned to them
    // -------------------------------
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'REVIEWER', 'VIEWER')")
    public ResponseEntity<ApiResponse<WorkflowResponse>> getWorkflowById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        WorkflowResponse response = workflowService.getWorkflowById(id, currentUser);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // -------------------------------
    // LIST ALL WORKFLOWS (Paginated)
    // Admin + Manager + Reviewer: all workflows
    // Viewer: only workflows assigned to the current viewer
    // -------------------------------
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'REVIEWER', 'VIEWER')")
    public ResponseEntity<ApiResponse<Page<WorkflowResponse>>> getAllWorkflows(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {

        Page<WorkflowResponse> workflows = workflowService.getAllWorkflows(pageable, currentUser);

        return ResponseEntity.ok(ApiResponse.success(workflows));
    }

    // -------------------------------
    // SEARCH WORKFLOWS
    // Admin + Manager + Reviewer
    // -------------------------------
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'REVIEWER')")
    public ResponseEntity<ApiResponse<Page<WorkflowResponse>>> searchWorkflows(
            @RequestParam(required = false) WorkflowState state,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            Pageable pageable) {

        Page<WorkflowResponse> workflows = workflowService.searchWorkflows(state, search, fromDate, toDate, pageable);

        return ResponseEntity.ok(ApiResponse.success(workflows));
    }

    // -------------------------------
    // UPDATE WORKFLOW
    // Admin + Manager
    // -------------------------------
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<WorkflowResponse>> updateWorkflow(
            @PathVariable Long id,
            @Valid @RequestBody WorkflowUpdateRequest request,
            @AuthenticationPrincipal User currentUser) throws JsonProcessingException {

        WorkflowResponse response = workflowService.updateWorkflow(id, request, currentUser);

        return ResponseEntity.ok(ApiResponse.success(response, "Workflow updated successfully"));
    }

    // -------------------------------
    // TRANSITION WORKFLOW (Approve/Reject)
    // Admin + Reviewer
    // -------------------------------
    @PostMapping("/{id}/transition")
    @PreAuthorize("hasAnyRole('ADMIN', 'REVIEWER', 'MANAGER')")
    public ResponseEntity<ApiResponse<WorkflowResponse>> transitionWorkflow(
            @PathVariable Long id,
            @Valid @RequestBody WorkflowTransitionRequest request,
            @AuthenticationPrincipal User currentUser) throws JsonProcessingException {

        WorkflowResponse response = workflowService.transitionWorkflow(id, request, currentUser);

        return ResponseEntity.ok(ApiResponse.success(response, "Workflow transitioned successfully"));
    }

    // -------------------------------
    // DELETE WORKFLOW
    // Admin Only
    // -------------------------------
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteWorkflow(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) throws JsonProcessingException {

        workflowService.deleteWorkflow(id, currentUser);

        return ResponseEntity.ok(ApiResponse.success(null, "Workflow deleted successfully"));
    }

    // -------------------------------
    // TRIGGER WORKFLOW (Python/Ai Integration)
    // Admin + Manager
    // -------------------------------
    @PostMapping("/{workflowName}/trigger")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<WorkflowTriggerResponse>> triggerWorkflow(
            @PathVariable String workflowName,
            @Valid @RequestBody WorkflowTriggerRequest request,
            @AuthenticationPrincipal User currentUser) {

        WorkflowTriggerResponse response = workflowIntegrationService.triggerWorkflow(workflowName, request,
                currentUser);

        return ResponseEntity.ok(ApiResponse.success(response, "Workflow triggered successfully"));
    }
}
