import { Box } from "@mui/material"
import Navbar from "./Navbar"
import SideBar from "./SideBar"
import { useLoaderData } from "@remix-run/react"

const Layout = ({ children }: { children: React.ReactNode }) => {
  const loaderData = useLoaderData()
  return (
    <Box
      sx={{
        height: "100vh",
        minWidth: "100vw",
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
      }}
    >
      <Box sx={{ width: "15%", height: "100%" }}>
        <SideBar loaderData={loaderData} />
      </Box>
      <Box sx={{ width: "85%" }}>
        <Box>{children}</Box>
      </Box>
    </Box>
  )
}

export default Layout
