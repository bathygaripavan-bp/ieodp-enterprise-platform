import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { login } from "./authSlice";
import type { Role } from "../types/auth";
import { useState, useEffect } from "react";

import { authApi } from "../api/auth.api";

// ROLE IMAGES
import adminImg from "../assets/admin.jpg";
import managerImg from "../assets/manager.jpg";
import reviewerImg from "../assets/reviewer.jpg";
import viewerImg from "../assets/viewer.jpg";

// RANDOM EMPLOYEE IMAGE FOR SIGN-IN
const getRandomEmployeeImage = () =>
  `https://images.unsplash.com/featured/?office,employees,work&ts=${Date.now()}`;

const ROLE_CONTENT: Record<
  Role,
  { image: string; title: string; description: string }
> = {
  ADMIN: {
    image: adminImg,
    title: "Enterprise Administration & Governance",
    description:
      "Administrators manage governance, access control, compliance, audits, and system stability.",
  },
  MANAGER: {
    image: managerImg,
    title: "Team Leadership & Performance Management",
    description:
      "Managers oversee workflows, team productivity, approvals, analytics, and operational efficiency.",
  },
  REVIEWER: {
    image: reviewerImg,
    title: "Workflow Review & Quality Assurance",
    description:
      "Reviewers validate workflows, ensure quality, and maintain compliance.",
  },
  VIEWER: {
    image: viewerImg,
    title: "Insights, Monitoring & Transparency",
    description: "Viewers access dashboards and reports in read-only mode.",
  },
};

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [mode, setMode] = useState<"login" | "register">("login");

  // Fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [bgImage, setBgImage] = useState(getRandomEmployeeImage());

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Background handling
  useEffect(() => {
    if (mode === "login") {
      setBgImage(getRandomEmployeeImage());
    } else if (mode === "register" && selectedRole) {
      setBgImage(ROLE_CONTENT[selectedRole].image);
    }
  }, [mode, selectedRole]);

  // --------------------------
  // ROLE-BASED REDIRECT LOGIC
  // --------------------------
  const getRedirectPath = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "/admin-dashboard";
      case "MANAGER":
        return "/manager-dashboard";
      case "REVIEWER":
        return "/reviewer-dashboard";
      case "VIEWER":
        return "/viewer-dashboard";
      default:
        return "/dashboard";
    }
  };

  // Redirect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const role = localStorage.getItem("role") || "";
      const redirectUrl = getRedirectPath(role);
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // VALIDATION LOGIC
  const validate = () => {
    const errors: Record<string, string> = {};

    if (mode === "login") {
      // Username
      if (!username) errors.username = "Username is required";
      else if (/\s/.test(username)) errors.username = "Username cannot contain spaces";
      else if (username.length < 3) errors.username = "Username must be at least 3 characters";
      else if (username.length > 100) errors.username = "Username too long";
      else if (username.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) {
        errors.username = "Enter a valid email address";
      }

      // Password
      if (!password) errors.password = "Password is required";
      else if (password.length < 8) errors.password = "Password must be at least 8 characters";
      else if (password.length > 64) errors.password = "Password too long";
      else if (/^\s|\s$/.test(password)) errors.password = "Password cannot have leading or trailing spaces";

    } else {
      // Register
      // First Name
      if (!firstName) errors.firstName = "First Name is required";
      else if (!/^[A-Za-z]+$/.test(firstName)) errors.firstName = "First Name must contain only alphabets";
      else if (firstName.length < 2) errors.firstName = "First Name must be at least 2 characters";
      else if (firstName.length > 50) errors.firstName = "First Name too long";

      // Last Name
      if (!lastName) errors.lastName = "Last Name is required";
      else if (!/^[A-Za-z]+$/.test(lastName)) errors.lastName = "Last Name must contain only alphabets";
      else if (lastName.length < 2) errors.lastName = "Last Name must be at least 2 characters";
      else if (lastName.length > 50) errors.lastName = "Last Name too long";

      // Username (Email)
      if (!username) errors.username = "Username is required";
      else if (/\s/.test(username)) errors.username = "Username cannot contain spaces";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) errors.username = "Enter a valid email address";
      else if (username.length < 5) errors.username = "Username must be at least 5 characters";
      else if (username.length > 100) errors.username = "Username too long";

      // Password
      if (!password) errors.password = "Password is required";
      else if (password.length < 8) errors.password = "Password must be at least 8 characters";
      else if (password.length > 64) errors.password = "Password too long";
      else if (/\s/.test(password)) errors.password = "Password cannot contain spaces";
      else {
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[@#$%&*]/.test(password);
        if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
          errors.password = "Password must meet complexity requirements";
        }
      }

      // Confirm Password
      if (!confirmPassword) errors.confirmPassword = "Confirm Password is required";
      else if (confirmPassword !== password) errors.confirmPassword = "Passwords do not match";

      // Role
      if (!selectedRole) errors.selectedRole = "Please select a role";
    }
    return errors;
  };

  const validationErrors = validate();
  const isFormValid = Object.keys(validationErrors).length === 0;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // LOGIN FUNCTION
  const handleLogin = async () => {
    if (!isFormValid) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await authApi.login({ username, password });

      const {
        id,
        accessToken,
        refreshToken,
        role,
        firstName: fName,
        lastName: lName,
        username: uName,
        email
      } = res.data.data;
      const normalizedRole = role.toUpperCase() as Role;

      // Store tokens and user details
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("role", normalizedRole);
      localStorage.setItem("user", JSON.stringify({
        id,
        firstName: fName,
        lastName: lName,
        username: uName,
        email,
      }));

      dispatch(login({
        role: normalizedRole,
        user: {
          id,
          firstName: fName,
          lastName: lName,
          username: uName,
          email,
        }
      }));
    } catch (err: any) {
      console.error(err);
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  // REGISTER FUNCTION
  const handleRegister = async () => {
    if (!isFormValid) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authApi.register({
        firstName,
        lastName,
        username,
        email: username,
        password,
        role: selectedRole,
      } as any);

      setSuccess("Registration successful. Please sign in.");
      setMode("login");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Registration error:", error);
      const msg = error?.response?.data?.message || "Registration failed.";
      if (msg.toLowerCase().includes("exist") || error?.response?.status === 409) {
        setError("Username already exists");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const content =
    mode === "register" && selectedRole
      ? ROLE_CONTENT[selectedRole]
      : {
        title: "Enterprise Workflow Platform",
        description: (
          <span
            style={{
              textAlign: "justify",
              display: "block",
              lineHeight: 1.7,
              fontSize: "15px",
            }}
          >
            The <b>Intelligent Enterprise Operations & Decision Platform (IEODP)</b> is a
            next-generation, <b>AI-enhanced workflow automation</b> and decision-making platform
            designed to streamline <b>enterprise operations</b>, enforce <b>governance</b>, simplify
            <b>approval workflows</b>, and provide <b>real-time insights</b> across organizational
            teams. IEODP unifies <b>workflow lifecycle management</b>, <b>role-based decision
              control</b>, and <b>data-driven operational intelligence</b> into one cohesive system.
            It enables organizations to automate repetitive processes, create <b>transparent audit
              trails</b>, integrate external services, and empower teams with <b>actionable
                analytics</b>.
          </span>
        ),
      };


  return (
    <Box
      key={bgImage}
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.75)),
          url(${bgImage})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* LEFT INFO */}
      <Box
        flex={1}
        px={8}
        pt={6}
        display={{ xs: "none", md: "flex" }}
        flexDirection="column"
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Typography variant="h3" fontWeight={700} color="#E0F2FE" mb={2}>
            Intelligent Enterprise Operations & Decision Platform (IEODP)
          </Typography>

          <Typography variant="h5" color="#F8FAFC" mb={2}>
            {content.title}
          </Typography>

          <Typography color="#E5E7EB" maxWidth="70%" lineHeight={2}>
            {content.description}
          </Typography>
        </motion.div>
      </Box>

      {/* RIGHT AUTH BOX */}
      <Box
        width={{ xs: "100%", md: 420 }}
        bgcolor="rgba(15,23,42,0.92)"
        color="#fff"
        p={4}
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        <Typography variant="h5" mb={3} textAlign="center">
          {mode === "login" ? "Sign In" : "Register"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
        )}

        {mode === "register" && (
          <>
            <TextField
              fullWidth
              label="First Name"
              margin="normal"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => handleBlur("firstName")}
              error={touched.firstName && !!validationErrors.firstName}
              helperText={touched.firstName && validationErrors.firstName}
            />
            <TextField
              fullWidth
              label="Last Name"
              margin="normal"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => handleBlur("lastName")}
              error={touched.lastName && !!validationErrors.lastName}
              helperText={touched.lastName && validationErrors.lastName}
            />
          </>
        )}

        <TextField
          fullWidth
          label="Username"
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={() => handleBlur("username")}
          error={touched.username && !!validationErrors.username}
          helperText={touched.username && validationErrors.username}
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleBlur("password")}
          error={touched.password && !!validationErrors.password}
          helperText={touched.password && validationErrors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {mode === "register" && (
          <>
            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              error={touched.confirmPassword && !!validationErrors.confirmPassword}
              helperText={touched.confirmPassword && validationErrors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              select
              label="Select Role"
              margin="normal"
              value={selectedRole ?? ""}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              onBlur={() => handleBlur("selectedRole")}
              error={touched.selectedRole && !!validationErrors.selectedRole}
              helperText={touched.selectedRole && validationErrors.selectedRole}
            >
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="MANAGER">Manager</MenuItem>
              <MenuItem value="REVIEWER">Reviewer</MenuItem>
              <MenuItem value="VIEWER">Viewer</MenuItem>
            </TextField>
          </>
        )}

        <Button
          fullWidth
          variant="contained"
          disabled={!isFormValid || loading}
          sx={{ mt: 3 }}
          onClick={mode === "login" ? handleLogin : handleRegister}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : (mode === "login" ? "Sign In" : "Register")}
        </Button>

        <Divider sx={{ my: 3 }} />

        <Typography textAlign="center">
          {mode === "login" ? (
            <Button onClick={() => {
              setMode("register");
              setError(null);
              setSuccess(null);
              setTouched({});
            }}>Register</Button>
          ) : (
            <Button onClick={() => {
              setMode("login");
              setError(null);
              setSuccess(null);
              setTouched({});
            }}>Sign In</Button>
          )}
        </Typography>
      </Box>
    </Box>
  );
}
