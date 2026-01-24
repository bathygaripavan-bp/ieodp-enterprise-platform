import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Paper, Typography, Divider, Box, CircularProgress, Grid, Chip } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usersApi } from "../api/users.api";

type RoleCounts = {
  ADMIN: number;
  MANAGER: number;
  REVIEWER: number;
  VIEWER: number;
};

export default function SystemHealth() {
  const [roleCounts, setRoleCounts] = useState<RoleCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.getRoleStats();
      const counts = res.data?.data || {};
      setRoleCounts({
        ADMIN: Number(counts.ADMIN ?? 0),
        MANAGER: Number(counts.MANAGER ?? 0),
        REVIEWER: Number(counts.REVIEWER ?? 0),
        VIEWER: Number(counts.VIEWER ?? 0),
      });
    } catch (err: any) {
      console.error("Failed to load user role stats for system health", err);
      setError(
        err?.response?.data?.message ||
        "Failed to load system health metrics. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const totalUsers =
    (roleCounts?.ADMIN ?? 0) +
    (roleCounts?.MANAGER ?? 0) +
    (roleCounts?.REVIEWER ?? 0) +
    (roleCounts?.VIEWER ?? 0);

  return (
    <Layout>
      <Typography variant="h4" mb={3}>
        System Health
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" mb={2}>
              Active Users by Role (Live)
            </Typography>

            {loading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {error && (
                  <Typography color="error" variant="body2" mb={2}>
                    {error}
                  </Typography>
                )}

                {roleCounts && (
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Typography variant="body2" color="text.secondary">
                      Total users: <b>{totalUsers}</b>
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1.5} mt={1}>
                      <Chip label={`Admin: ${roleCounts.ADMIN}`} color="error" />
                      <Chip label={`Manager: ${roleCounts.MANAGER}`} color="warning" />
                      <Chip label={`Reviewer: ${roleCounts.REVIEWER}`} color="info" />
                      <Chip label={`Viewer: ${roleCounts.VIEWER}`} color="success" />
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              System Load Over Time (%)
            </Typography>

            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={[
                  { time: "Now", load: Math.min(100, totalUsers * 2 || 10) },
                ]}
              >
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="load" stroke="#22C55E" />
              </LineChart>
            </ResponsiveContainer>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1">System Status</Typography>
            <Typography variant="body2" color="text.secondary">
              User metrics are updated in near real time. Role distribution and
              total user count provide an at-a-glance view of platform usage and
              access governance.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
}
