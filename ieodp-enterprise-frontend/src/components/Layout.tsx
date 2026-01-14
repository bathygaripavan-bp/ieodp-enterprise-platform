import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box display="flex">
      <Sidebar />
      <Box flexGrow={1}>
        <Topbar />
        <Box p={3}>{children}</Box>
      </Box>
    </Box>
  );
}
