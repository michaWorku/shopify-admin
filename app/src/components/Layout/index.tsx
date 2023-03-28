import { Box } from "@mui/material";
import Navbar from "./Navbar";
import SideBar from "./SideBar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box sx={{ height: "100vh", width: "100vw", display: 'flex' }}>
      <Box sx={{ width: '15%' }}>
        <SideBar/>
      </Box>
      <Box sx={{width: '85%'}}>
        <Box>
          <Navbar />
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
