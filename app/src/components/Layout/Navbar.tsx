import { useTheme } from "@emotion/react";
import { Breadcrumbs, Stack, Theme } from "@mui/material";
import { AppBar, Box, Toolbar } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import React, { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import Profile from "./Profile";
import palette from "~/src/theme/palette";

const Navbar = ({ breadcrumbs }: any) => {
  const theme = useTheme() as Theme;
  const loaderData = useLoaderData();
  console.log({ loaderData, breadcrumbs });
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
            }}
          >
            <Stack spacing={2}>
              <Breadcrumbs
                separator={
                  <NavigateNextIcon fontSize="medium" color={"primary"} />
                }
                aria-label="breadcrumb"
              >
                {breadcrumbs}
              </Breadcrumbs>
            </Stack>
          </Box>
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
