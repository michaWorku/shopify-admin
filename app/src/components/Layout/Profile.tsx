import {
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { User } from "@prisma/client";
import { Form } from "@remix-run/react";
import LogoutIcon from "@mui/icons-material/Logout";
import { Profile as ProfilePic } from "public/assets";
import { FC } from "react";

interface Props {
  user: Partial<User>;
  anchorElUser: HTMLElement | null;
  handleOpenUserMenu: (event: React.MouseEvent<HTMLElement>) => void;
  handleCloseUserMenu: () => void;
}

const Profile = ({
  anchorElUser,
  handleOpenUserMenu,
  handleCloseUserMenu,
  user,
}: Props) => {
  return (
    <Box sx={{ flexGrow: 0}}>
      <Tooltip title="Profile">
        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
          <Avatar alt="profile picture" src={ProfilePic} />
        </IconButton>
      </Tooltip>
      <Menu
        sx={{
          mt: 8,
          ml: 0,
          "& .MuiPaper-root": {
            width: "333px",
            height: "auto",
          },
        }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        <MenuItem
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h5" component="h6" textAlign="center">
            {user?.firstName + " " + user?.lastName}
          </Typography>
        </MenuItem>
        <MenuItem
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="body2" component="h6" textAlign="center">
            {user?.email}
          </Typography>
        </MenuItem>
        <MenuItem
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Form action="/logout" method="post">
            <Button
              type="submit"
              variant="text"
              sx={{
                p: 1,
                // mx: 2,
                mt: 1,
                fontWeight: 700,
                lineHeight: 1.5,
                fontSize: { sm: 15, md: 18, lg: 20 },
                color: "primary.main",
              }}
              fullWidth
              // color="inherit"
              startIcon={<LogoutIcon />}
              disableRipple={true}
              disableFocusRipple={true}
              disableElevation={true}
            >
              Sign out
            </Button>
          </Form>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Profile;
