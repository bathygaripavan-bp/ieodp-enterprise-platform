import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Typography,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { MENU_CONFIG } from "../utils/permissions";
import * as Icons from "@mui/icons-material";

const drawerWidth = 260;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const role = useAppSelector((s) => s.auth.role);

  const menuItems = MENU_CONFIG.filter(
    (item) => role && item.roles.includes(role)
  );

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent fontSize="small" /> : <Icons.HelpOutline fontSize="small" />;
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.05)",
          color: "#fff",
        },
      }}
    >
      <Box p={3} mb={2}>
        <Typography variant="h5" fontWeight={900} letterSpacing={-1} sx={{
          background: "linear-gradient(45deg, #6366F1 30%, #22D3EE 90%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          IEODP ENT
        </Typography>
        <Typography variant="caption" color="rgba(255,255,255,0.4)" fontWeight={600}>
          ENTERPRISE PLATFORM
        </Typography>
      </Box>

      <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.05)" }} />

      <List sx={{ px: 1.5 }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2.5,
                mb: 0.5,
                py: 1.2,
                transition: "all 0.2s ease",
                backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : "transparent",
                color: active ? theme.palette.primary.main : "rgba(255,255,255,0.7)",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  color: "#fff",
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon sx={{
                minWidth: 40,
                color: active ? theme.palette.primary.main : "inherit"
              }}>
                {getIcon(item.icon)}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: active ? 700 : 500,
                  fontSize: "0.875rem"
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}
