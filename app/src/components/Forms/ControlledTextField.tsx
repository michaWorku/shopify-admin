import { TextField } from "@mui/material";
import { Control, Controller } from "react-hook-form";

type ControlledTextFieldProps = {
  type?: string;
  name: string;
  label: string;
  defaultValue?: string;
  control: Control<any>;
  errors: any;
  placeholder?: string;
  actionData?: any;
  style?: any;
  [x: string]: any;
};
/**
 * A controlled text field component that utilizes React Hook Form's Controller component.
 * @component ControlledTextField
 * @param {Object} props - The props object
 * @param {string} props.type - The type of input field.
 * @param {string} props.name - The name of the input field.
 * @param {string} props.label - The label of the input field.
 * @param {string} [props.defaultValue=""] - The default value of the input field.
 * @param {Object} props.control - The control object from React Hook Form.
 * @param {Object} props.errors - The errors object from React Hook Form.
 * @param {Array<string>} props.actionData - The array of action data for the input field.
 * @param {string} [props.placeholder=""] - The placeholder text for the input field.
 * @param {Object} [props.style={}] - The styles object for the input field.
 * @param {...Object} props.props - Any other props that should be passed to the input field.
 * @returns {JSX.Element} A React element representing the controlled text field.
 */
 const ControlledTextField: React.FC<ControlledTextFieldProps> = ({
  type,
  name,
  label,
  defaultValue = "",
  control,
  errors,
  actionData,
  placeholder = "",
  style = {},
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field: { value, ...field }, fieldState: { isDirty } }) => {
        return (
          <TextField
            {...field}
            value={isDirty ? value : defaultValue}
            onChange={(e) =>
              field.onChange(
                type === "number"
                  ? Number(e.target.value)
                    ? Number(e.target.value)
                    : ""
                  : e.target.value
              )
            }
            label={label}
            type={type || "text"}
            placeholder={placeholder}
            variant="outlined"
            error={!!errors || !!actionData}
            helperText={
              !!errors ? errors : !!actionData ? actionData.join(" ") : null
            }
            {...props}
            sx={{
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
              ...style,
            }}
          />
        );
      }}
    />
  );
};

export default ControlledTextField;
