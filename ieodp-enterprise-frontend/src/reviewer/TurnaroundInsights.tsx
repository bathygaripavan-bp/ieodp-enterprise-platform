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
  { name: "< 1 Day", value: 42 },
  { name: "1–3 Days", value: 36 },
  { name: "> 3 Days", value: 22 },
];

const COLORS = ["#22C55E", "#F59E0B", "#EF4444"];

export default function TurnaroundInsights() {
  return (
    <Layout>
      <Typography variant="h4" mb={3}>
        Turnaround Time Insights
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Review Completion Time Distribution
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

        <Typography variant="subtitle1">Efficiency Summary</Typography>
        <Typography variant="body2" color="text.secondary">
          A majority of reviews are completed within one day, demonstrating high
          operational efficiency. Reviews exceeding three days may require
          additional clarification or cross-team collaboration.
        </Typography>
      </Paper>
    </Layout>
  );
}
