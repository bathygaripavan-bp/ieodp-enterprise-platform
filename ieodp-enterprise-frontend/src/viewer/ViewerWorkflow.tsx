import { Card, CardContent, Typography } from "@mui/material";

export default function ViewerWorkflow() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">Workflow Overview</Typography>
        <Typography color="text.secondary">
          Read-only view of workflow progress, approvals, and completion status.
        </Typography>

        <Typography mt={2}>
          📊 Workflow distribution and approval trend chart will appear here.
        </Typography>
      </CardContent>
    </Card>
  );
}
