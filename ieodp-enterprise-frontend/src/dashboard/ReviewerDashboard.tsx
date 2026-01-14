import Layout from "../components/Layout";
import { Box, Paper, Typography } from "@mui/material";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const stats = [
  { label: "Items to Review", value: 26 },
  { label: "Approved Today", value: 14 },
  { label: "Rejected Today", value: 3 },
];

const chartData = [
  { day: "Mon", approved: 8, rejected: 2 },
  { day: "Tue", approved: 10, rejected: 1 },
  { day: "Wed", approved: 6, rejected: 3 },
  { day: "Thu", approved: 12, rejected: 2 },
  { day: "Fri", approved: 9, rejected: 1 },
];

export default function ReviewerDashboard() {
  return (
    <Layout>
      <Typography variant="h4" mb={3}>
        Reviewer Dashboard
      </Typography>

      {/* KPI CARDS */}
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
        gap={2}
      >
        {stats.map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="h3">{item.value}</Typography>
            </Paper>
          </motion.div>
        ))}
      </Box>

      {/* CHART */}
      <Box mt={4}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>
            Daily Review Outcomes
          </Typography>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="approved" fill="#22C55E" />
              <Bar dataKey="rejected" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>

          {/* Written Insight */}
          <Box mt={3}>
            <Typography variant="subtitle1">
              Review Insights
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Approval rates remain consistently higher than rejections across
              the week, indicating good submission quality. Occasional increases
              in rejections highlight the need for clearer validation guidelines
              during peak review periods.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
}
