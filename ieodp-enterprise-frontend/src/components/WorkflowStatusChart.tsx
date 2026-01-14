import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Paper, Typography } from "@mui/material";

const data = [
  { status: "CREATED", count: 12 },
  { status: "REVIEW", count: 18 },
  { status: "APPROVED", count: 32 },
  { status: "REJECTED", count: 6 },
  { status: "REOPENED", count: 4 },
];

export default function WorkflowStatusChart() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>
        Workflow Status Overview
      </Typography>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="status" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#6366F1" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
