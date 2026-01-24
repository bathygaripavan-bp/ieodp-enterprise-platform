import { createTheme } from "@mui/material/styles";
import { tokens } from "./tokens";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: tokens.primary },
    secondary: { main: tokens.secondary },
    background: {
      default: tokens.background,
      paper: tokens.surface,
    },
  },
  shape: { borderRadius: 12 },
});
