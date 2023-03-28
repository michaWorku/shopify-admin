import { useTheme } from "@emotion/react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { SewasewLogo } from "public/assets";
import React, { useEffect, useState } from "react";
import { Form, Link, useLoaderData, useLocation } from "@remix-run/react";
import MobileNav from "./SideBar";
import Profile from "./Profile";

const Navbar = () => {
  const theme = useTheme() as Theme;
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const loaderData = useLoaderData();

  useEffect(() => {
    console.log({ loaderData, location });
  }, [loaderData]);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const toggleMenu = () => {
    setMenuOpen((menuOpen) => !menuOpen);
  };

  return (
    <>
      <AppBar
        position="static"
        style={{
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mr: { xs: 0, sm: 2, md: 4 },
            ml: 1,
            my: 2,
          }}
        >
          <Link prefetch="intent" to="/client">
            <Box sx={{alignSelf: 'start'}}>
              <Typography variant="h6" component="h6">
               {
                location.pathname.slice(1)
               }
              </Typography>
            </Box>
          </Link>
          <Profile
            user={loaderData?.data?.user}
            anchorElUser={anchorElUser}
            handleCloseUserMenu={handleCloseUserMenu}
            handleOpenUserMenu={handleOpenUserMenu}
          />
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;
