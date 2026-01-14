import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    TextField,
    Button,
    Paper,
    Typography,
    MenuItem,
    Box
} from "@mui/material";
import Layout from "../components/Layout";
import { workflowsApi } from "../api/workflows.api";
import { usersApi } from "../api/users.api";

export default function CreateWorkflow() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        priority: "MEDIUM",
        category: "",
        assignedToId: ""
    });

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await usersApi.getAll();
                setUsers(res.data.data.content);
            } catch (err) {
                console.error("Failed to fetch users", err);
            }
        };
        fetchUsers();
    }, []);

    const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            const payload = {
                title: form.title,
                description: form.description,
                priority: form.priority,
                category: form.category,
                assignedToId: form.assignedToId ? Number(form.assignedToId) : null
            };

            const res = await workflowsApi.create(payload);

            console.log("Created:", res.data);

            alert("Workflow Created Successfully!");

            navigate("/workflows");
        } catch (err: any) {
            console.error("Error creating workflow", err.response?.data || err);
            alert("Error creating workflow");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Typography variant="h4" mb={3}>
                Create Workflow
            </Typography>

            <Paper sx={{ p: 3 }}>
                <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                        label="Title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        fullWidth
                        required
                    />

                    <TextField
                        label="Description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        multiline
                        rows={4}
                        fullWidth
                    />

                    <TextField
                        select
                        label="Priority"
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                        fullWidth
                    >
                        {priorities.map((p) => (
                            <MenuItem value={p} key={p}>
                                {p}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Category"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        select
                        label="Assign To"
                        name="assignedToId"
                        value={form.assignedToId}
                        onChange={handleChange}
                        fullWidth
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {users.map((u) => (
                            <MenuItem key={u.id} value={u.id}>
                                {u.firstName} {u.lastName} (@{u.username})
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Workflow"}
                    </Button>
                </Box>
            </Paper>
        </Layout>
    );
}
