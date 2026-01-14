import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
  Alert,
  Chip,
  IconButton,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Badge,
  CalendarMonth,
  Update,
  Lock,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import apiClient from "../api/apiClient";

type RouteParams = {
  id?: string;
  userId?: string;
};

type UserProfile = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Profile() {
  const { id, userId } = useParams<RouteParams>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const effectiveUserId = userId ?? id;

  // -----------------------------
  // Helpers
  // -----------------------------
  const buildProfileFromResponse = (raw: any): UserProfile => {
    const data = raw?.data ?? raw?.user ?? raw;

    const resolvedRole =
      data?.role?.name ??
      data?.role?.code ??
      data?.role ??
      (Array.isArray(data?.roles) ? data.roles[0]?.name : "") ??
      "";

    return {
      id: Number(
        data?.id ??
        data?.userId ??
        data?.user_id ??
        data?.userID ??
        data?.user_id_pk ??
        0
      ),
      username:
        data?.username ??
        data?.userName ??
        data?.user_name ??
        data?.login ??
        "",
      firstName: data?.firstName ?? data?.first_name ?? "",
      lastName: data?.lastName ?? data?.last_name ?? "",
      email: data?.email ?? "",
      role: resolvedRole,
      createdAt: data?.createdAt ?? data?.created_at ?? "",
      updatedAt: data?.updatedAt ?? data?.updated_at ?? "",
    };
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      let response;
      if (effectiveUserId) {
        // Admin/manager viewing another user
        response = await apiClient.get(`/users/${effectiveUserId}`);
      } else {
        // Current logged-in user
        response = await apiClient.get("/users/me");
      }

      const userProfile = buildProfileFromResponse(response.data);

      if (!userProfile.id) {
        throw new Error("User ID missing in response");
      }

      setProfile(userProfile);
      setForm({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        password: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        navigate("/login", { replace: true });
        return;
      }

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load profile";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserId]);

  const handleChange =
    (field: keyof FormState) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
      };

  const validateForm = (): boolean => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.");
      return false;
    }

    if (!emailRegex.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }

    const hasPassword = form.password.trim().length > 0 || form.confirmPassword.trim().length > 0;
    if (hasPassword) {
      if (form.password.trim().length < 8) {
        setError("Password must be at least 8 characters long.");
        return false;
      }
      if (form.password.trim() !== form.confirmPassword.trim()) {
        setError("Password and confirm password must match.");
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!profile) return;

    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload: any = {
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      };

      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      const response = await apiClient.put(`/users/${profile.id}`, payload);
      const updatedProfile = buildProfileFromResponse(response.data);

      setProfile(updatedProfile);
      setForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));

      setSuccess("Profile updated successfully.");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update profile";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  if (loading) {
    return (
      <Layout>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
        >
          <Typography variant="h6">
            Unable to load profile. Please try again later.
          </Typography>
        </Box>
      </Layout>
    );
  }

  const initials =
    (profile.firstName?.[0] || "") + (profile.lastName?.[0] || "");

  return (
    <Layout>
      <Box mb={4} component={motion.div} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Typography
          variant="h4"
          fontWeight={800}
          gutterBottom
          sx={{
            background: "linear-gradient(45deg, #6366F1 0%, #22D3EE 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Profile
        </Typography>
        <Typography color="text.secondary">
          View and update your personal information.
        </Typography>
      </Box>

      {error && (
        <Box mb={2}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {success && (
        <Box mb={2}>
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Box>
      )}

      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          p: 4,
          borderRadius: 4,
          background: "rgba(15, 23, 42, 0.7)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              textAlign="center"
            >
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  mb: 2,
                  fontSize: 32,
                  background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
                }}
              >
                {initials || profile.username?.[0] || "U"}
              </Avatar>

              <Typography variant="h6" fontWeight={600}>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography color="text.secondary">
                @{profile.username}
              </Typography>
              <Chip
                label={profile.role || "N/A"}
                size="small"
                sx={{
                  mt: 1.5,
                  fontWeight: 600,
                  borderRadius: 999,
                  px: 1.5,
                  backgroundColor: "rgba(56, 189, 248, 0.15)",
                  color: "#22d3ee",
                  border: "1px solid rgba(56, 189, 248, 0.4)",
                }}
              />

              <Divider sx={{ my: 3, width: "100%", borderColor: "rgba(148, 163, 184, 0.1)" }} />

              <Box sx={{ width: "100%", textAlign: "left" }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <CalendarMonth sx={{ color: "text.secondary", fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Member Since
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {profile.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric", day: "numeric" })
                        : "N/A"}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={1.5}>
                  <Update sx={{ color: "text.secondary", fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Last Updated
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {profile.updatedAt
                        ? new Date(profile.updatedAt).toLocaleDateString("en-US", { month: "long", year: "numeric", day: "numeric" })
                        : "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First name"
                  value={form.firstName}
                  onChange={handleChange("firstName")}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last name"
                  value={form.lastName}
                  onChange={handleChange("lastName")}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="New password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  variant="outlined"
                  placeholder="Minimum 8 characters"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showPassword ? "Hide password" : "Show password"}>
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            aria-label="toggle password visibility"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  variant="outlined"
                  placeholder="Re-enter new password"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showConfirmPassword ? "Hide password" : "Show password"}>
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            aria-label="toggle confirm password visibility"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    disabled={saving}
                    onClick={() => {
                      setForm({
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        email: profile.email,
                        password: "",
                        confirmPassword: "",
                      });
                      setError(null);
                      setSuccess(null);
                      setShowPassword(false);
                      setShowConfirmPassword(false);
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Layout>
  );
}
