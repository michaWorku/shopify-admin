import { checkboxClasses } from "@mui/material";
import palette from "../palette";

const MuiCheckbox = {
  styleOverrides: {
    root: {
      color: palette.primary.main,
      [`&.${checkboxClasses.checked}`]: {
        color: palette.primary.main,
      },
    },
  },
};

export default MuiCheckbox;
