import palette from "../palette";

const MuiTextField = {
  styleOverrides: {
    root: {
    //   "& .MuiTextField-root": { my: 1 },
      "& .MuiInputLabel-root ": {
        color: "primary.main",
        fontSize: "1rem",
        fontWeight: "400",
      },
      "& .MuiTypography-root": {
        color: "primary.main",
        fontSize: "1rem",
        fontWeight: "400",
      },
      "& legend": { display: "none" },
      "& fieldset": { top: 0 },
      "& .MuiSelect-select": {
        font: "normal normal normal 16px/39px Roboto",
        pl: 1.5,
        bgcolor: "#f5f5f5",
        border: "1px solid #fff",
        borderRadius: "5px 5px 0px 0px",
        color: palette.primary.main,
      },
    },
  },
};
export default MuiTextField;
