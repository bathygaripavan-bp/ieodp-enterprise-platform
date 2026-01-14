import { Box, Paper, Typography } from "@mui/material";

export default function WorkflowTimeline({ history = [] }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>
        Workflow Timeline
      </Typography>

      <Box display="flex" flexDirection="column" gap={1}>
        {history.map((item: any, index: number) => (
          <Typography key={index}>
            {item.status} → {new Date(item.timestamp).toLocaleString()}
          </Typography>
        ))}
      </Box>
    </Paper>
  );
}
