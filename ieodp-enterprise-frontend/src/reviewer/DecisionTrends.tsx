import Layout from "../components/Layout";
import { Paper, Typography, Divider } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mon", approved: 12, rejected: 4 },
  { day: "Tue", approved: 15, rejected: 3 },
  { day: "Wed", approved: 10, rejected: 6 },
  { day: "Thu", approved: 18, rejected: 2 },
  { day: "Fri", approved: 16, rejected: 4 },
];

export default function DecisionTrends() {
  return (
    <Layout>
      <Typography variant="h4" mb={3}>
        Decision Trends
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Approval vs Rejection Trend
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line dataKey="approved" stroke="#22C55E" />
            <Line dataKey="rejected" stroke="#EF4444" />
          </LineChart>
        </ResponsiveContainer>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1">Decision Analysis</Typography>
        <Typography variant="body2" color="text.secondary">
          Approval rates remain consistently higher than rejections, indicating
          strong adherence to submission guidelines. Spikes in rejections midweek
          suggest quality variations in incoming requests.
        </Typography>
      </Paper>
    </Layout>
  );
}
