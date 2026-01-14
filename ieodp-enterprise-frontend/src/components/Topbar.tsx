import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useAppDispatch } from "../app/hooks";
import { logout } from "../auth/authSlice";

export default function Topbar() {
  const dispatch = useAppDispatch();

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6">IEODP Enterprise</Typography>
        <Box display="flex" gap={2}>
          <Button color="inherit" onClick={() => (window.location.href = "/profile")}>
            Profile
          </Button>
          <Button color="inherit" onClick={() => dispatch(logout())}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
