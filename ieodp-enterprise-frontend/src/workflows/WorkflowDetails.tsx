import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import {
  Box,
  Button,
  Paper,
  Typography,
  Chip,
  Divider,
  Grid,
  CircularProgress,
  TextField,
  Card,
  CardContent,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Timeline as TimelineIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import { workflowsApi } from "../api/workflows.api";
import { useAppSelector } from "../app/hooks";
import { motion } from "framer-motion";

export default function WorkflowDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = useAppSelector((s) => s.auth.role);

  const [workflow, setWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [comment, setComment] = useState("");

  const loadWorkflow = async () => {
    try {
      const res = await workflowsApi.getById(Number(id));
      setWorkflow(res.data.data);
    } catch (err) {
      console.error("Failed to load workflow", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflow();
  }, [id]);

  const updateStatus = async (action: string) => {
    setTransitioning(true);
    try {
      await workflowsApi.transition(Number(id), {
        action,
        comments: comment
      });
      setComment("");
      await loadWorkflow();
    } catch (err) {
      alert("Transition failed");
    } finally {
      setTransitioning(false);
    }
  };

  const triggerWorkflow = async () => {
    if (!workflow?.title) return;
    setTriggering(true);
    try {
      await workflowsApi.triggerByName(workflow.title, {
        payload: { workflowId: workflow.id },
      });
      alert("Workflow trigger invoked successfully.");
    } catch (err) {
      console.error("Trigger failed", err);
      alert("Failed to trigger workflow integration.");
    } finally {
      setTriggering(false);
    }
  };

  if (loading) return (
    <Layout>
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    </Layout>
  );

  if (!workflow) return <Layout><Typography>Workflow not found</Typography></Layout>;

  return (
    <Layout>
      <Box mb={4} display="flex" alignItems="center" gap={2}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate("/workflows")}
          sx={{ borderRadius: 2 }}
        >
          Back to List
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* LEFT: MAIN INFO */}
        <Grid size={{ xs: 12, md: 8 }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Paper sx={{
              p: 4,
              borderRadius: 4,
              background: "rgba(17, 24, 39, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {workflow.title}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Chip label={workflow.state} color="primary" />
                    <Chip label={workflow.priority} variant="outlined" />
                    <Chip label={workflow.category} variant="outlined" />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Description
              </Typography>
              <Typography color="text.secondary" paragraph>
                {workflow.description}
              </Typography>

              <Box mt={4}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Actions & Transitions
                </Typography>
                <Box bgcolor="rgba(255,255,255,0.03)" p={3} borderRadius={3}>
                  <TextField
                    fullWidth
                    label="Add a comment to this transition..."
                    multiline
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Box display="flex" gap={2} flexWrap="wrap">
                    {/* CREATED -> REVIEWED (SUBMIT) */}
                    {(workflow.state === "CREATED" || workflow.state === "REOPENED") && (
                      <Button
                        variant="contained"
                        onClick={() => updateStatus("SUBMIT")}
                        disabled={transitioning}
                      >
                        Submit for Review
                      </Button>
                    )}

                    {/* REVIEWED -> APPROVED/REJECTED */}
                    {workflow.state === "REVIEWED" && (role === "MANAGER" || role === "ADMIN") && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => updateStatus("APPROVE")}
                          disabled={transitioning}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => updateStatus("REJECT")}
                          disabled={transitioning}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {/* REJECTED -> REOPENED */}
                    {workflow.state === "REJECTED" && (role === "MANAGER" || role === "VIEWER") && (
                      <Button
                        variant="outlined"
                        onClick={() => updateStatus("REOPEN")}
                        disabled={transitioning}
                      >
                        Reopen Workflow
                      </Button>
                    )}

                    {/* TRIGGER WORKFLOW (Python / AI Integration) */}
                    {(role === "ADMIN" || role === "MANAGER") && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={triggerWorkflow}
                        disabled={triggering}
                      >
                        {triggering ? "Triggering..." : "Trigger Integration"}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* RIGHT: METADATA & TIMELINE */}
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Box display="flex" flexDirection="column" gap={3}>
              <Card sx={{ borderRadius: 4, background: "rgba(30, 41, 59, 0.4)" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom display="flex" alignItems="center" gap={1}>
                    <TimelineIcon color="primary" /> Details
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2} mt={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <PersonIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Created By</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {workflow.createdBy?.username || "Admin"}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                      <PersonIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Assigned To</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {workflow.assignedTo?.username || "Unassigned"}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                      <EventIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Created Date</Typography>
                        <Typography variant="body2">
                          {new Date(workflow.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {workflow.comments && (
                <Card sx={{ borderRadius: 4, background: "rgba(30, 41, 59, 0.4)" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom display="flex" alignItems="center" gap={1}>
                      <CommentIcon color="primary" /> Latest Comment
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: "italic", mt: 1 }}>
                      "{workflow.comments}"
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          </motion.div>
        </Grid>
      </Grid>
    </Layout>
  );
}
