import Layout from "../components/Layout";
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  alpha,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  HistoryOutlined as ActivityIcon,
  Circle as StatusIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { auditApi } from "../api/audit.api";

export default function ViewerActivity() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await auditApi.getAll({ size: 20 });
        setLogs(res.data.data.content);
      } catch (err) {
        console.error("Failed to fetch activity logs", err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  return (
    <Layout>
      <Box mb={4}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            Activity Overview
          </Typography>
          <Typography color="text.secondary">
            A comprehensive audit trail of system-wide operations and events.
          </Typography>
        </motion.div>
      </Box>

      <Paper
        sx={{
          p: 4,
          borderRadius: 4,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
          <ActivityIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Recent System Events
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress />
          </Box>
        ) : (
          <List disablePadding>
            {logs.map((log, idx) => (
              <Box key={log.id}>
                <ListItem sx={{ py: 2, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <StatusIcon sx={{ fontSize: 10, color: "primary.main" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Typography variant="body1" fontWeight={600}>
                          {log.action}
                        </Typography>
                        <Chip
                          label={log.entityType}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            bgcolor: alpha(log.action.includes("CREATE") ? "#22C55E" : "#6366F1", 0.1),
                            color: log.action.includes("CREATE") ? "#22C55E" : "#6366F1",
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Performed by <b>{log.performedBy.username}</b> • {new Date(log.createdAt).toLocaleString()}
                      </Typography>
                    }
                  />
                </ListItem>
                {idx < logs.length - 1 && <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />}
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Layout>
  );
}
