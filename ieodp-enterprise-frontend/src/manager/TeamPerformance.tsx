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
  { name: "Alice", tasks: 24 },
  { name: "Bob", tasks: 18 },
  { name: "Charlie", tasks: 30 },
  { name: "Diana", tasks: 22 },
];

export default function TeamPerformance() {
  return (
    <Layout>
      <Typography variant="h4" mb={3}>
        Team Performance
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Tasks Completed by Team Members
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="tasks" fill="#22D3EE" />
          </BarChart>
        </ResponsiveContainer>

        <Divider sx={{ my: 3 }} />

        {/* Written Insights */}
        <Typography variant="subtitle1" gutterBottom>
          Performance Summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This chart highlights individual team productivity based on completed
          tasks. Charlie shows the highest task completion, indicating strong
          efficiency and workload handling. Bob has comparatively lower task
          completion, which may indicate either lighter workload allocation or
          potential performance improvement areas.
        </Typography>
      </Paper>
    </Layout>
  );
}
