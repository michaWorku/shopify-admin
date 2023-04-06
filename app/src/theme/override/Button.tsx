import palette from "../palette";

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    login: true;
    logout: true;
    plan: true;
    getSubscription: true;
    profileEdit: true;
    export: true;
    add: true;
    text: true;
  }
}

const MuiButton = {
  styleOverrides: {
    root: {
      fontSize: "1.2rem",
      color: "#fff",
      borderRadius: "8px",
      ":hover": {
        color: palette.primary.main,
        background: "#e5e5e5",
      },
    },
    export: {
      fontSize: "0.875rem",
      borderRadius: "8px",
      color: palette.primary.main,
      ":hover": {
        background: palette.grey[100],
      },
    },
    add: {
      fontSize: "0.875rem",
      borderRadius: "8px",
      background: palette.primary.main,
      color: "#FFF",
      ":hover": {
        background: palette.grey[100],
        color: palette.primary.main,
      },
    },
    text: {
      fontSize: "0.875rem",
      borderRadius: "8px",
      background: "#FFF",
      color: "#ffcc00",
      ":hover": {
        background: "#FFF",
        color: "#ffcc00",
      },
    },
  },
};

export default MuiButton;
