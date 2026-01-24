import React from "react";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  Divider,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { login } from "./authSlice";
import type { Role } from "../types/auth";

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

  const [mode, setMode] = React.useState<"login" | "register">("login");

  // Fields
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);

  const [bgImage, setBgImage] = React.useState(getRandomEmployeeImage());

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Background handling
  React.useEffect(() => {
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
  React.useEffect(() => {
    if (isAuthenticated) {
      const role = localStorage.getItem("role") || "";
      const redirectUrl = getRedirectPath(role);
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // LOGIN FUNCTION
  const handleLogin = async () => {
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
    } catch (error) {
      alert("Invalid username or password");
      console.error(error);
    }
  };

  // REGISTER FUNCTION
  const handleRegister = async () => {
    if (!selectedRole) {
      alert("Please select a role");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await authApi.register({
        firstName,
        lastName,
        username,
        email: username,
        password,
        role: selectedRole,
      } as any);

      alert("Registration successful. Please sign in.");
      setMode("login");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Registration error:", error);

      alert(
        error?.response?.data?.message ||
        "Registration failed. Try a different username."
      );
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

        {mode === "register" && (
          <>
            <TextField
              fullWidth
              label="First Name"
              margin="normal"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <TextField
              fullWidth
              label="Last Name"
              margin="normal"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </>
        )}

        <TextField
          fullWidth
          label="Username"
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          sx={{ mt: 3 }}
          onClick={mode === "login" ? handleLogin : handleRegister}
        >
          {mode === "login" ? "Sign In" : "Register"}
        </Button>

        <Divider sx={{ my: 3 }} />

        <Typography textAlign="center">
          {mode === "login" ? (
            <Button onClick={() => setMode("register")}>Register</Button>
          ) : (
            <Button onClick={() => setMode("login")}>Sign In</Button>
          )}
        </Typography>
      </Box>
    </Box>
  );
}
