import palette from "../palette";

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    login: true;
    logout: true;
    plan: true;
    getSubscription: true;
    profileEdit: true;
    export: true;
    add: true
  }
}

const MuiButton = {
  styleOverrides: {
    root: {
      fontSize: "1.2rem",
      color: "#fff",
      borderRadius: "8px",
      ":hover": {
        color: "#4E0D0E",
        background: "#e5e5e5",
      },
    },
    export: {
      fontSize: "0.875rem",
      borderRadius: "8px",
      color: "#4E0D0E",
      ':hover':{
        background: palette.grey[100],
      }
    },
    add: {
      fontSize: "0.875rem",
      borderRadius: "8px",
      background: '#4E0D0E',
      color: "#FFF",
      ':hover':{
        background: palette.grey[100],
        color: '#4E0D0E'
      }
    },
  },
};

export default MuiButton;
