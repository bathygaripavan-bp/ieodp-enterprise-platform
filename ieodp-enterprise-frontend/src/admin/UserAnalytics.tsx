import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Paper, Typography, Divider, Box, CircularProgress } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usersApi } from "../api/users.api";

type RoleChartDatum = { role: string; users: number };

export default function UserAnalytics() {
  const [data, setData] = useState<RoleChartDatum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.getRoleStats();
      const counts = res.data?.data || {};
      const roles = ["ADMIN", "MANAGER", "REVIEWER", "VIEWER"];
      const chartData: RoleChartDatum[] = roles.map((r) => ({
        role: r,
        users: Number(counts[r] ?? 0),
      }));
      setData(chartData);
    } catch (err: any) {
      console.error("Failed to load user role stats", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load user analytics. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <Layout>
      <Typography variant="h4" mb={3}>
        User Management Analytics
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          User Distribution by Role
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Typography color="error" variant="body2" mb={2}>
                {error}
              </Typography>
            )}

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="role" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="users" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1">Admin Insights</Typography>
        <Typography variant="body2" color="text.secondary">
          These analytics use live role counts from the platform. Viewer and
          Reviewer roles typically dominate for broad visibility, while Admin
          and Manager accounts remain intentionally limited for governance and
          control.
        </Typography>
      </Paper>
    </Layout>
  );
}
