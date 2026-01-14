import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../auth/Login";
import ProtectedRoute from "../auth/ProtectedRoute";

// Dashboards
import AdminDashboard from "../dashboard/AdminDashboard";
import ManagerDashboard from "../dashboard/ManagerDashboard";
import ReviewerDashboard from "../dashboard/ReviewerDashboard";
import ViewerDashboard from "../dashboard/ViewerDashboard";

// Workflow Pages
import WorkflowList from "../workflows/WorkflowList";
import WorkflowDetails from "../workflows/WorkflowDetails";
import CreateWorkflow from "../workflows/CreateWorkflow";
import EditWorkflow from "../workflows/EditWorkflow";

// Manager Sections
import TeamPerformance from "../manager/TeamPerformance";
import TaskAnalytics from "../manager/TaskAnalytics";
import ApprovalInsights from "../manager/ApprovalInsights";

// Admin Sections
import UserAnalytics from "../admin/UserAnalytics";
import SystemHealth from "../admin/SystemHealth";
import AuditCompliance from "../admin/AuditCompliance";

// Reviewer Sections
import ReviewQueueAnalytics from "../reviewer/ReviewQueueAnalytics";
import DecisionTrends from "../reviewer/DecisionTrends";
import TurnaroundInsights from "../reviewer/TurnaroundInsights";

// User Management
import UserList from "../users/UserList";
import Profile from "../users/Profile";

// Viewer Sections
import ViewerActivityOverview from "../viewer/ViewerActivity";
import ViewerReportSummary from "../viewer/ViewerReports";
import ViewerUsageTrend from "../viewer/ViewerUsage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "REVIEWER", "VIEWER"]}>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* ================= ADMIN ================= */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/user-analytics"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <UserAnalytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/system-health"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <SystemHealth />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/audit-compliance"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AuditCompliance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <UserList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/:userId"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* ================= MANAGER ================= */}
      <Route
        path="/manager-dashboard"
        element={
          <ProtectedRoute allowedRoles={["MANAGER"]}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/team-performance"
        element={
          <ProtectedRoute allowedRoles={["MANAGER"]}>
            <TeamPerformance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/task-analytics"
        element={
          <ProtectedRoute allowedRoles={["MANAGER"]}>
            <TaskAnalytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/approval-insights"
        element={
          <ProtectedRoute allowedRoles={["MANAGER"]}>
            <ApprovalInsights />
          </ProtectedRoute>
        }
      />

      {/* ================= REVIEWER ================= */}
      <Route
        path="/reviewer-dashboard"
        element={
          <ProtectedRoute allowedRoles={["REVIEWER"]}>
            <ReviewerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reviewer/queue-analytics"
        element={
          <ProtectedRoute allowedRoles={["REVIEWER"]}>
            <ReviewQueueAnalytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reviewer/decision-trends"
        element={
          <ProtectedRoute allowedRoles={["REVIEWER"]}>
            <DecisionTrends />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reviewer/turnaround-insights"
        element={
          <ProtectedRoute allowedRoles={["REVIEWER"]}>
            <TurnaroundInsights />
          </ProtectedRoute>
        }
      />

      {/* ================= VIEWER ================= */}
      <Route
        path="/viewer-dashboard"
        element={
          <ProtectedRoute allowedRoles={["VIEWER"]}>
            <ViewerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/viewer/activity-overview"
        element={
          <ProtectedRoute allowedRoles={["VIEWER"]}>
            <ViewerActivityOverview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/viewer/report-summary"
        element={
          <ProtectedRoute allowedRoles={["VIEWER"]}>
            <ViewerReportSummary />
          </ProtectedRoute>
        }
      />

      <Route
        path="/viewer/usage-trend"
        element={
          <ProtectedRoute allowedRoles={["VIEWER"]}>
            <ViewerUsageTrend />
          </ProtectedRoute>
        }
      />

      {/* =============== WORKFLOWS =============== */}
      <Route
        path="/workflows"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "REVIEWER", "VIEWER"]}>
            <WorkflowList />
          </ProtectedRoute>
        }
      />

      {/* Create Workflow */}
      <Route
        path="/workflows/create"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <CreateWorkflow />
          </ProtectedRoute>
        }
      />

      {/* Edit Workflow */}
      <Route
        path="/workflows/edit/:id"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <EditWorkflow />
          </ProtectedRoute>
        }
      />

      {/* Workflow Details */}
      <Route
        path="/workflows/:id"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "REVIEWER"]}>
            <WorkflowDetails />
          </ProtectedRoute>
        }
      />

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
