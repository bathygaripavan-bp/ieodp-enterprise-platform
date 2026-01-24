import Layout from "../components/Layout";
import { Box, Paper, Typography } from "@mui/material";
import { motion } from "framer-motion";
import WorkflowStatusChart from "../components/WorkflowStatusChart";

export default function ManagerDashboard() {
  const stats = [
    { label: "Pending Approvals", value: 12 },
    { label: "Completed Tasks", value: 340 },
    { label: "Team Members", value: 18 },
  ];

  return (
    <Layout>
      <Typography variant="h4" mb={3}>
        Manager Dashboard
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
        <WorkflowStatusChart />
      </Box>
    </Layout>
  );
}
