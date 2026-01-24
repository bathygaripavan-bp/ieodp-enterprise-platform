import Layout from "../components/Layout";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  useTheme,
  alpha,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  AssessmentOutlined as ReportsIcon,
  DashboardOutlined as DashboardIcon,
  TimelineOutlined as ActivityIcon,
  NotificationsNoneOutlined as AlertIcon,
  VisibilityOutlined as ViewIcon,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { auditApi } from "../api/audit.api";
import { workflowsApi } from "../api/workflows.api";

export default function ViewerDashboard() {
  const theme = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = [
    { label: "Active Workflows", value: workflows.length, icon: <DashboardIcon color="success" />, color: "#22C55E" },
    { label: "Recent Alerts", value: logs.length, icon: <AlertIcon color="warning" />, color: "#F59E0B" },
    { label: "Reports Generated", value: 12, icon: <ReportsIcon color="primary" />, color: "#6366F1" },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [auditRes, workflowRes] = await Promise.all([
          auditApi.getAll({ size: 10 }),
          workflowsApi.getAll(0, 100)
        ]);
        setLogs(auditRes.data.data.content);
        setWorkflows(workflowRes.data.data.content);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Simple aggregation for chart (mocking trend based on actual count for visual)
  const chartData = [
    { day: "Mon", activity: 20 },
    { day: "Tue", activity: 35 },
    { day: "Wed", activity: 25 },
    { day: "Thu", activity: 48 },
    { day: "Fri", activity: 30 },
    { day: "Sat", activity: 15 },
    { day: "Sun", activity: 22 },
  ];

  if (loading) return (
    <Layout>
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress thickness={2} size={60} />
      </Box>
    </Layout>
  );

  return (
    <Layout>
      <Box mb={4}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            Viewer Overview
          </Typography>
          <Typography color="text.secondary">
            Welcome back. Here's a real-time summary of enterprise activities and analytic reports.
          </Typography>
        </motion.div>
      </Box>

      {/* KPI CARDS */}
      <Grid container spacing={3}>
        {stats.map((item, index) => (
          <Grid key={item.label} size={{ xs: 12, md: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${alpha(item.color, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
                  backdropFilter: "blur(10px)",
                  border: `1px solid ${alpha(item.color, 0.2)}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: alpha(item.color, 0.1),
                    color: item.color,
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                  }}
                >
                  {item.icon}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                    {item.label}
                  </Typography>
                  <Typography variant="h4" fontWeight={800}>
                    {item.value}
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} mt={1}>
        {/* MAIN CHART */}
        <Grid size={{ xs: 12, md: 8 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: "background.paper",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                height: "100%",
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={700}>
                  System activity (Last 7 Days)
                </Typography>
                <ActivityIcon color="action" />
              </Box>

              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: alpha(theme.palette.background.paper, 0.9),
                        borderRadius: 12,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(4px)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="activity"
                      stroke="#6366F1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorActivity)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* RECENT ACTIVITY SIDEBAR */}
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                maxHeight: 460,
                overflowY: "auto",
              }}
            >
              <Typography variant="h6" fontWeight={700} mb={2}>
                Recent Insights
              </Typography>
              <List disablePadding>
                {logs.map((log, idx) => (
                  <Box key={log.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <ViewIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={log.action}
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {log.performedBy?.username || "System"} • {new Date(log.createdAt).toLocaleTimeString()}
                          </Typography>
                        }
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: 600,
                          noWrap: true,
                        }}
                      />
                    </ListItem>
                    {idx < logs.length - 1 && <Divider component="li" />}
                  </Box>
                ))}
              </List>
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                  * All data represents a 24-hour lookback period.
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Layout>
  );
}
