import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Theme,
} from "@mui/material";
import { Link, NavLink, useLoaderData, useMatches } from "@remix-run/react";
import { SewasewLogo } from "public/assets";
import PeopleIcon from "@mui/icons-material/People";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ListAltIcon from "@mui/icons-material/ListAlt";
import palette from "~/src/theme/palette";

const ListItems = [
  {
    item: "client",
    icon: <PeopleIcon />,
  },
  {
    item: "role",
    icon: <HowToRegIcon />,
  },
  {
    item: "system users",
    icon: <PeopleAltIcon />,
  },
  {
    item: "users",
    icon: <PeopleAltIcon />,
  },
  {
    item: "bulk tasks",
    icon: <ListAltIcon />,
  },
];

const SideBar = () => {
  return (
    <Box
      sx={{
        background:
          "transparent linear-gradient(180deg, #642525 0%, #240101 100%)",
        boxShadow: "3px 3px 6px #00000014",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "start",
        color: "#EAFEDB",
        height: "100vh",
      }}
    >
      <Box sx={{ alignSelf: "center", my: 4 }}>
        <Link prefetch="intent" to="/">
          <img
            src={SewasewLogo}
            height="65px"
            width="65px"
            alt="sewasew logo"
            style={{
              cursor: "pointer",
            }}
          />
        </Link>
      </Box>
      <List
        component="nav"
        aria-label="main mailbox folders"
        sx={{
          // "& .Mui-selected": {
          // bgcolor: '#642525'
          width: "100%",
          pl: 2,
          // },
        }}
      >
        {ListItems.map((list, key) => (
          <ListItemButton
            key={key}
            component={NavLink}
            to={`/${list.item.split(" ").join("")}`}
            // @ts-ignore
            style={({ isActive }) =>
              isActive
                ? {
                    color: "#FFCC00",
                    backgroundColor: palette.primary.lighter,
                    // backgroundColor: "#944236",
                    borderRight: "5px  solid #FFCC00 ",
                    "& .MuiListItemIconRoot": {
                      color: "#FFCC00",
                    },
                  }
                : {
                    color: "#EAFEDB",
                    textDecoration: "none",
                    "& .MuiListItemIconRoot": {
                      color: "#EAFEDB",
                    },
                  }
            }
            sx={{
              "&:hover": {
                bgcolor: "#755343",
                borderRight: "5px  solid #4E0D0E ",
              },
              // justifyContent: open ? "initial" : "center",
            }}
          >
            <ListItemIcon
              sx={{
                "& .MuiSvgIcon-root": {
                  color: "#EAFEDB",
                },
              }}
            >
              {list?.icon}
            </ListItemIcon>
            <ListItemText
              primary={list.item.charAt(0).toUpperCase() + list.item.slice(1)}
              sx={{
                "& .MuiTypography-root": {
                  fontWeight: 600,
                  lineHeight: 22 / 14,
                },
              }}
            />
            <Divider sx={{ bgcolor: "#fc0" }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default SideBar;
