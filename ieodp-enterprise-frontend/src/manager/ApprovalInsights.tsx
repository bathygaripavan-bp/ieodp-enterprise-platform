import Layout from "../components/Layout";
import { Paper, Typography, Divider } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Approved", value: 68 },
  { name: "Rejected", value: 20 },
  { name: "Pending", value: 12 },
];

const COLORS = ["#22C55E", "#EF4444", "#F59E0B"];

export default function ApprovalInsights() {
  return (
    <Layout>
      <Typography variant="h4" mb={3}>
        Approval Insights
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Approval Decision Distribution
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <Divider sx={{ my: 3 }} />

        {/* Written Insights */}
        <Typography variant="subtitle1" gutterBottom>
          Decision Insights
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The majority of workflows are successfully approved, indicating strong
          compliance and effective review processes. However, the presence of
          rejected and pending requests suggests opportunities to improve
          submission quality and reduce approval turnaround time.
        </Typography>
      </Paper>
    </Layout>
  );
}
