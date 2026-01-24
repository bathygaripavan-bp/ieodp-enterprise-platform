import Layout from "../components/Layout";
import { Box, Paper, Typography, Grid, Card, CardContent } from "@mui/material";
import { motion } from "framer-motion";
import WorkflowStatusChart from "../components/WorkflowStatusChart";
import {
  People as PeopleIcon,
  Assignment as TaskIcon,
  Error as AlertIcon,
  CheckCircle as SuccessIcon,
} from "@mui/icons-material";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Users", value: 1240, icon: <PeopleIcon />, color: "#6366F1" },
    { label: "Active Workflows", value: 87, icon: <TaskIcon />, color: "#22D3EE" },
    { label: "Completed Today", value: 12, icon: <SuccessIcon />, color: "#22C55E" },
    { label: "System Alerts", value: 5, icon: <AlertIcon />, color: "#EF4444" },
  ];

  return (
    <Layout>
      <Box mb={4}>
        <Typography variant="h3" fontWeight={800} gutterBottom>
          System Overview
        </Typography>
        <Typography color="text.secondary">
          Welcome back, Administrator. Here's what's happening in your organization today.
        </Typography>
      </Box>

      {/* KPI CARDS */}
      <Grid container spacing={3} mb={4}>
        {stats.map((item, index) => (
          <Grid key={item.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card sx={{
                borderRadius: 4,
                background: "rgba(30, 41, 59, 0.5)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                        {item.label}
                      </Typography>
                      <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                        {item.value}
                      </Typography>
                    </Box>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 3,
                      backgroundColor: `${item.color}20`,
                      color: item.color,
                      display: "flex",
                    }}>
                      {item.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 4, background: "rgba(30, 41, 59, 0.4)" }}>
            <Typography variant="h6" fontWeight={700} mb={3}>
              Workflow Distribution
            </Typography>
            <Box height={350}>
              <WorkflowStatusChart />
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 4, background: "rgba(30, 41, 59, 0.4)" }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="body2" color="text.secondary">
                Monitor system performance and user activity in real-time.
              </Typography>
              {/* Add more quick shortcuts here */}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
}
