import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Tooltip,
    CircularProgress,
    TextField,
    InputAdornment,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    FormControlLabel,
    Switch,
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Person as PersonIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { usersApi } from "../api/users.api";
import Layout from "../components/Layout";
import { useAppSelector } from "../app/hooks";

interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    enabled: boolean;
    createdAt: string;
}

export default function UserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const role = useAppSelector((s) => s.auth.role);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await usersApi.getAll();
            setUsers(res.data.data.content);
        } catch (err) {
            console.error("Failed to load users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleEdit = (user: User) => {
        setSelectedUser({ ...user });
        setOpenDialog(true);
    };

    const handleUpdate = async () => {
        if (!selectedUser) return;
        setSaving(true);
        try {
            await usersApi.update(selectedUser.id, {
                email: selectedUser.email,
                firstName: selectedUser.firstName,
                lastName: selectedUser.lastName,
                role: selectedUser.role,
                enabled: selectedUser.enabled,
            });
            setOpenDialog(false);
            loadUsers();
        } catch (err) {
            alert("Failed to update user");
        } finally {
            setSaving(false);
        }
    };
    const handleProfile = (id: number) => {
        navigate(`/users/${id}`);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await usersApi.delete(id);
                loadUsers();
            } catch (err) {
                alert("Failed to delete user");
            }
        }
    };

    const filteredUsers = users.filter(
        (u) =>
            u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <Box mb={4}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        User Management
                    </Typography>
                    <Typography color="text.secondary">
                        Manage your organization's users, roles, and permissions.
                    </Typography>
                </motion.div>
            </Box>

            <Paper
                sx={{
                    p: 3,
                    borderRadius: 4,
                    background: "rgba(17, 24, 39, 0.7)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
            >
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                >
                    <TextField
                        placeholder="Search users..."
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: 300 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {loading ? (
                    <Box display="flex" justifyContent="center" py={10}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>User</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Created At</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <AnimatePresence>
                                    {filteredUsers.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            component={motion.tr}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            hover
                                        >
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <PersonIcon color="primary" />
                                                    <Box>
                                                        <Typography fontWeight={600}>
                                                            {user.firstName} {user.lastName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            @{user.username} • {user.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.role}
                                                    size="small"
                                                    color={
                                                        user.role === "ADMIN"
                                                            ? "error"
                                                            : user.role === "MANAGER"
                                                                ? "warning"
                                                                : "primary"
                                                    }
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.enabled ? "Active" : "Disabled"}
                                                    size="small"
                                                    color={user.enabled ? "success" : "default"}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="View Profile">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        sx={{ mr: 1 }}
                                                        onClick={() => handleProfile(user.id)}
                                                    >
                                                        <PersonIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        size="small"
                                                        color="info"
                                                        sx={{ mr: 1 }}
                                                        onClick={() => handleEdit(user)}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {role === "ADMIN" && (
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDelete(user.id)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* EDIT DIALOG */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2.5} pt={2}>
                        <TextField
                            label="First Name"
                            fullWidth
                            variant="outlined"
                            value={selectedUser?.firstName || ""}
                            onChange={(e) => setSelectedUser(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                        />
                        <TextField
                            label="Last Name"
                            fullWidth
                            variant="outlined"
                            value={selectedUser?.lastName || ""}
                            onChange={(e) => setSelectedUser(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                        />
                        <TextField
                            label="Email"
                            fullWidth
                            value={selectedUser?.email || ""}
                            onChange={(e) => setSelectedUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                        />
                        <TextField
                            label="Role"
                            fullWidth
                            select
                            value={selectedUser?.role || ""}
                            onChange={(e) => setSelectedUser(prev => prev ? { ...prev, role: e.target.value } : null)}
                        >
                            <MenuItem value="ADMIN">Admin</MenuItem>
                            <MenuItem value="MANAGER">Manager</MenuItem>
                            <MenuItem value="REVIEWER">Reviewer</MenuItem>
                            <MenuItem value="VIEWER">Viewer</MenuItem>
                        </TextField>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={selectedUser?.enabled || false}
                                    onChange={(e) => setSelectedUser(prev => prev ? { ...prev, enabled: e.target.checked } : null)}
                                    color="primary"
                                />
                            }
                            label={
                                <Typography variant="body2" fontWeight={500}>
                                    Account Enabled
                                </Typography>
                            }
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdate}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}
