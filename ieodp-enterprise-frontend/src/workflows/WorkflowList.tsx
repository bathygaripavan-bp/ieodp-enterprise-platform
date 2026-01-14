import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { workflowsApi } from "../api/workflows.api";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "../app/hooks";
import Layout from "../components/Layout";

interface Workflow {
  id: number;
  title: string;
  description: string;
  state: string;
  priority: string;
  category: string;
  createdBy: {
    username: string;
  };
  createdAt: string;
}

export default function WorkflowList() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const role = useAppSelector((s) => s.auth.role);

  const loadWorkflows = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await workflowsApi.getAll();
      setWorkflows(res.data?.data?.content ?? []);
    } catch (err) {
      console.error("Workflow fetch failed", err);
      const anyErr = err as any;
      const message =
        anyErr?.response?.data?.message ||
        anyErr?.message ||
        "Failed to load workflows. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this workflow permanently?")) {
      try {
        await workflowsApi.delete(id);
        loadWorkflows();
      } catch (err) {
        alert("Failed to delete workflow");
      }
    }
  };

  const filteredWorkflows = workflows.filter((wf) =>
    wf.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return "error";
      case "HIGH": return "warning";
      case "MEDIUM": return "info";
      default: return "success";
    }
  };

  return (
    <Layout>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-end">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h3" fontWeight={800} sx={{
            background: "linear-gradient(45deg, #6366F1 30%, #22D3EE 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Workflows
          </Typography>
          <Typography color="text.secondary">
            Manage and track enterprise workflow pipelines.
          </Typography>
        </motion.div>

        {(role === "ADMIN" || role === "MANAGER") && (
          <Button
            variant="contained"
            disableElevation
            startIcon={<AddIcon />}
            onClick={() => navigate("/workflows/create")}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.2,
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)",
              }
            }}
          >
            New Workflow
          </Button>
        )}
      </Box>

      {error && (
        <Box mb={3}>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </Box>
      )}

      <Box mb={4} display="flex" gap={2}>
        <TextField
          placeholder="Search workflows..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.03)",
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          sx={{ borderRadius: 3, textTransform: "none" }}
        >
          Filters
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={12}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : filteredWorkflows.length === 0 ? (
        <Box
          py={10}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{ opacity: 0.9 }}
        >
          <Typography variant="h6" gutterBottom>
            No workflows found
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" maxWidth={360}>
            {searchTerm
              ? "Try adjusting your search term or clearing the filters."
              : "Once workflows are created, they will appear here."}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {filteredWorkflows.map((wf, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={wf.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Card sx={{
                    height: "100%",
                    borderRadius: 4,
                    background: "rgba(30, 41, 59, 0.5)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "rgba(99, 102, 241, 0.4)",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Chip
                          label={wf.state}
                          size="small"
                          sx={{
                            borderRadius: 1.5,
                            fontWeight: 700,
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            color: "#fff",
                            border: "1px solid rgba(255, 255, 255, 0.1)"
                          }}
                        />
                        <Chip
                          label={wf.priority}
                          size="small"
                          color={getPriorityColor(wf.priority)}
                          variant="outlined"
                          sx={{ borderRadius: 1.5, fontWeight: 700 }}
                        />
                      </Box>

                      <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
                        {wf.title}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{
                        mb: 3,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: 40
                      }}>
                        {wf.description}
                      </Typography>

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="caption" color="text.secondary">
                            By <b>{wf.createdBy?.username || "System"}</b>
                          </Typography>
                        </Box>

                        <Box>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/workflows/${wf.id}`)}
                              sx={{ color: "primary.main" }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {(role === "ADMIN" || role === "MANAGER") && (
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/workflows/edit/${wf.id}`)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {role === "ADMIN" && (
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(wf.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}
    </Layout>
  );
}
