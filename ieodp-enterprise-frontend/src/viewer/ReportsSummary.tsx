import Layout from "../components/Layout";
import { Paper, Typography, Divider, Box, alpha, useTheme } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

const data = [
  { name: "Financial", value: 18, color: "#6366F1" },
  { name: "Operational", value: 14, color: "#22C55E" },
  { name: "Compliance", value: 10, color: "#F59E0B" },
];

export default function ReportsSummary() {
  const theme = useTheme();

  return (
    <Layout>
      <Box mb={4}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            Reports Summary
          </Typography>
          <Typography color="text.secondary">
            Strategic distribution and categorization of enterprise governance reports.
          </Typography>
        </motion.div>
      </Box>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            background: "rgba(17, 24, 39, 0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={3}>
            Distribution by Category
          </Typography>

          <Box height={400}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                >
                  {data.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.color}
                      stroke={alpha(entry.color, 0.2)}
                      strokeWidth={10}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.9)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          <Divider sx={{ my: 4, opacity: 0.1 }} />

          <Box p={2} bgcolor={alpha(theme.palette.primary.main, 0.05)} borderRadius={3}>
            <Typography variant="body1" color="text.secondary" lineHeight={1.6}>
              Reports are dynamically categorized using our enterprise classification engine.
              The current focus on <strong>Financial</strong> and <strong>Operational</strong> domains
              reflects the ongoing quarterly audit cycle. Use these insights to drive
              data-backed decision making across departments.
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Layout>
  );
}
