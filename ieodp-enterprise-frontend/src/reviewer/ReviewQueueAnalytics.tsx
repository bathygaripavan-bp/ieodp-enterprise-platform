import Layout from "../components/Layout";
import { Paper, Typography, Divider } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { status: "Pending", count: 14 },
  { status: "Reviewed", count: 38 },
  { status: "Escalated", count: 6 },
];

export default function ReviewQueueAnalytics() {
  return (
    <Layout>
      <Typography variant="h4" mb={3}>
        Review Queue Analytics
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Current Review Queue Status
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#38BDF8" />
          </BarChart>
        </ResponsiveContainer>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1">Queue Insights</Typography>
        <Typography variant="body2" color="text.secondary">
          Most items in the review queue have already been processed. A small
          pending backlog remains, while escalated items require senior review
          or policy clarification.
        </Typography>
      </Paper>
    </Layout>
  );
}
