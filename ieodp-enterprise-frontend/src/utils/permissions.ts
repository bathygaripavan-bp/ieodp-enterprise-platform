import type { Role } from "../types/auth";


export interface MenuItem {
  label: string;
  path: string;
  roles: Role[];
  icon: string; // MUI icon name
}

export const MENU_CONFIG: MenuItem[] = [
  // ================= ADMIN =================
  { label: "Admin Dashboard", path: "/admin-dashboard", roles: ["ADMIN"], icon: "Dashboard" },
  { label: "Workflows", path: "/workflows", roles: ["ADMIN", "MANAGER", "REVIEWER", "VIEWER"], icon: "AccountTree" },
  { label: "User Management", path: "/admin/users", roles: ["ADMIN", "MANAGER"], icon: "People" },
  { label: "User Analytics", path: "/admin/user-analytics", roles: ["ADMIN"], icon: "Analytics" },
  { label: "System Health", path: "/admin/system-health", roles: ["ADMIN"], icon: "HealthAndSafety" },
  { label: "Audit & Compliance", path: "/admin/audit-compliance", roles: ["ADMIN"], icon: "HistoryEdu" },

  // ================= MANAGER =================
  { label: "Manager Dashboard", path: "/manager-dashboard", roles: ["MANAGER"], icon: "Dashboard" },
  { label: "Team Performance", path: "/manager/team-performance", roles: ["MANAGER"], icon: "People" },
  { label: "Task Analytics", path: "/manager/task-analytics", roles: ["MANAGER"], icon: "Analytics" },
  { label: "Approval Insights", path: "/manager/approval-insights", roles: ["MANAGER"], icon: "Assessment" },

  // ================= REVIEWER =================
  { label: "Reviewer Dashboard", path: "/reviewer-dashboard", roles: ["REVIEWER"], icon: "Dashboard" },
  { label: "Review Queue", path: "/reviewer/queue-analytics", roles: ["REVIEWER"], icon: "ListAlt" },
  { label: "Decision Trends", path: "/reviewer/decision-trends", roles: ["REVIEWER"], icon: "TrendingUp" },

  // ================= VIEWER =================
  { label: "Viewer Dashboard", path: "/viewer-dashboard", roles: ["VIEWER"], icon: "Dashboard" },
  { label: "Activity Overview", path: "/viewer/activity-overview", roles: ["VIEWER"], icon: "AccountTree" },
  { label: "Reports Summary", path: "/viewer/report-summary", roles: ["VIEWER"], icon: "Assessment" },
  { label: "Usage Trends", path: "/viewer/usage-trend", roles: ["VIEWER"], icon: "TrendingUp" },
  { label: "My Profile", path: "/profile", roles: ["ADMIN", "MANAGER", "REVIEWER", "VIEWER"], icon: "Person" },
];
