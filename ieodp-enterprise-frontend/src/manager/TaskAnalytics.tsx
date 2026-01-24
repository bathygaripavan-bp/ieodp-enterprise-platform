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
  { week: "Week 1", tasks: 40 },
  { week: "Week 2", tasks: 55 },
  { week: "Week 3", tasks: 48 },
  { week: "Week 4", tasks: 62 },
];

export default function TaskAnalytics() {
  return (
    <Layout>
      <Typography variant="h4" mb={3}>
        Task Analytics
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Weekly Task Completion Trend
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="tasks" stroke="#6366F1" />
          </LineChart>
        </ResponsiveContainer>

        <Divider sx={{ my: 3 }} />

        {/* Written Insights */}
        <Typography variant="subtitle1" gutterBottom>
          Trend Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The line chart illustrates a generally increasing trend in task
          completion over the four-week period. The dip in Week 3 may indicate
          temporary workload constraints or resource availability issues, while
          the strong rise in Week 4 reflects improved productivity and workflow
          optimization.
        </Typography>
      </Paper>
    </Layout>
  );
}
