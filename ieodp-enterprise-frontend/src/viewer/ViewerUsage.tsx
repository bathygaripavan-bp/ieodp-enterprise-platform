import Layout from "../components/Layout";
import {
  Paper,
  Typography,
  Box,
  alpha,
  useTheme,
  Grid,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

const usageData = [
  { month: "Jan", users: 400, actions: 2400 },
  { month: "Feb", users: 300, actions: 1398 },
  { month: "Mar", users: 200, actions: 9800 },
  { month: "Apr", users: 278, actions: 3908 },
  { month: "May", users: 189, actions: 4800 },
  { month: "Jun", users: 239, actions: 3800 },
];

export default function ViewerUsage() {
  const theme = useTheme();

  return (
    <Layout>
      <Box mb={4}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            Usage Trends
          </Typography>
          <Typography color="text.secondary">
            Deep dive into organizational platform adoption and interface interaction metrics.
          </Typography>
        </motion.div>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
              background: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <Typography variant="h6" fontWeight={700} mb={4}>
              Platform Engagement (6 Months)
            </Typography>

            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      backdropFilter: "blur(10px)",
                    }}
                  />
                  <Bar dataKey="users" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actions" fill="#22D3EE" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box mt={4} p={3} bgcolor={alpha(theme.palette.info.main, 0.05)} borderRadius={3} border={`1px solid ${alpha(theme.palette.info.main, 0.1)}`}>
              <Typography variant="body2" color="info.main" sx={{ fontStyle: "italic" }}>
                * Usage metrics are aggregated daily from system entry points and integrated microservices.
                Data synchronization occurs every 6 hours.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
}
