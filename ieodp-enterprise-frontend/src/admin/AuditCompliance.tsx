import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
  Paper,
  Typography,
  Divider,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { auditApi } from "../api/audit.api";

const data = [
  { name: "Compliant", value: 82 },
  { name: "Warnings", value: 12 },
  { name: "Violations", value: 6 },
];

const COLORS = ["#22C55E", "#F59E0B", "#EF4444"];

export default function AuditCompliance() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      console.log("Fetching audit logs...");
      console.log("Current role:", localStorage.getItem("role"));
      console.log("Token present:", !!localStorage.getItem("accessToken"));
      try {
        const res = await auditApi.getAll({ size: 50 });
        setLogs(res.data.data.content);
      } catch (err: any) {
        console.error("Failed to load audit logs", err);
        if (err.response) {
          console.error("Error response data:", err.response.data);
          console.error("Error response status:", err.response.status);
        }
        setError(err.response?.data?.message || err.message || "Failed to load logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <Layout>
      <Box mb={4}>
        <Typography variant="h3" fontWeight={800} gutterBottom>
          Audit & Compliance
        </Typography>
        <Typography color="text.secondary">
          Monitor system activity and compliance metrics across the enterprise.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 4, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Compliance Overview
            </Typography>
            <Box height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    innerRadius={60}
                    paddingAngle={5}
                  >
                    {data.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.9)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={600}>Summary</Typography>
            <Typography variant="body2" color="text.secondary">
              94% of system actions meet the defined governance policies. 6 system violations detected in the last 24 hours.
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{
            p: 3,
            borderRadius: 4,
            background: "rgba(17, 24, 39, 0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}>
            {error && (
              <Box mb={2} p={2} bgcolor="rgba(239, 68, 68, 0.1)" color="#EF4444" borderRadius={2} border="1px solid rgba(239, 68, 68, 0.2)">
                <Typography variant="body2">{error}</Typography>
              </Box>
            )}

            {loading ? (
              <Box display="flex" justifyContent="center" py={10}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Action</TableCell>
                      <TableCell>Entity</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {log.action}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.details}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={log.entityType} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{log.performedBy?.username || log.username || "System"}</Typography>
                          <Typography variant="caption" color="text.secondary">ID: {log.performedBy?.id || log.userId || "N/A"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
}
