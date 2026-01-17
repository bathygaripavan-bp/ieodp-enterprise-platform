import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    CircularProgress,
    MenuItem,
    Paper,
    TextField,
    Typography,
    Grid,
} from "@mui/material";
import {
    Save as SaveIcon,
    Cancel as CancelIcon,
} from "@mui/icons-material";
import { workflowsApi } from "../api/workflows.api";
import { usersApi } from "../api/users.api";
import Layout from "../components/Layout";
import { motion } from "framer-motion";

export default function EditWorkflow() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [workflow, setWorkflow] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [wfRes, usersRes] = await Promise.all([
                    workflowsApi.getById(Number(id)),
                    usersApi.getAll()
                ]);
                setWorkflow(wfRes.data.data);
                setUsers(usersRes.data.data.content);
            } catch (err) {
                console.error("Error loading data:", err);
                alert("Unable to load workflow details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                title: workflow.title,
                description: workflow.description,
                priority: workflow.priority,
                category: workflow.category,
                assignedToId: workflow.assignedToId ?? workflow.assignedTo?.id ?? null
            };
            await workflowsApi.update(Number(id), payload);
            navigate("/workflows");
        } catch (err: any) {
            console.error("Update failed:", err.response?.data || err);
            alert("Update failed: " + (err.response?.data?.message || "Internal Server Error"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <Layout>
            <Box display="flex" justifyContent="center" py={10}>
                <CircularProgress />
            </Box>
        </Layout>
    );

    return (
        <Layout>
            <Box maxWidth={800} mx="auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Typography variant="h4" fontWeight={700} mb={4}>
                        Edit Workflow
                    </Typography>

                    <Paper sx={{
                        p: 4,
                        borderRadius: 4,
                        background: "rgba(17, 24, 39, 0.7)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}>
                        <form onSubmit={handleSave}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        label="Title"
                                        required
                                        value={workflow.title || ""}
                                        onChange={(e) => setWorkflow({ ...workflow, title: e.target.value })}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        multiline
                                        rows={4}
                                        required
                                        value={workflow.description || ""}
                                        onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Priority"
                                        value={workflow.priority || ""}
                                        onChange={(e) => setWorkflow({ ...workflow, priority: e.target.value })}
                                    >
                                        <MenuItem value="LOW">Low</MenuItem>
                                        <MenuItem value="MEDIUM">Medium</MenuItem>
                                        <MenuItem value="HIGH">High</MenuItem>
                                        <MenuItem value="CRITICAL">Critical</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Category"
                                        value={workflow.category || ""}
                                        onChange={(e) => setWorkflow({ ...workflow, category: e.target.value })}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Assign To"
                                        required
                                        value={workflow.assignedToId ?? workflow.assignedTo?.id ?? ""}
                                        onChange={(e) => setWorkflow({ ...workflow, assignedToId: Number(e.target.value) })}
                                    >
                                        {users.map((u) => (
                                            <MenuItem key={u.id} value={u.id}>
                                                {u.firstName} {u.lastName} (@{u.username})
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                                        <Button
                                            startIcon={<CancelIcon />}
                                            onClick={() => navigate("/workflows")}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={saving}
                                            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                                        >
                                            {saving ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </motion.div>
            </Box>
        </Layout>
    );
}
