import { TextField } from "@mui/material";
import { FieldErrors } from "react-hook-form";

type ControlledTextFieldProps = {
  name: string;
  register: any;
  actionData?: any;
  errors: FieldErrors;
  defaultValue: any;
};

/**
 *
 * A component that renders a controlled TextField with validation errors and default value.
 * @component ControlledTextField
 * @typedef {object} ControlledTextFieldProps
 * @property {string} name - The name of the TextField.
 * @property {Function} register - The register function from react-hook-form library.
 * @property {object} actionData - The object containing data related to actions such as errors.
 * @property {object} errors - The object containing validation errors.
 * @property {string} defaultValue - The default value of the TextField.
 * @param {ControlledTextFieldProps} props - The props object containing the necessary properties.
 * @returns {JSX.Element} - The JSX element that renders the ControlledTextField component.
 */
const ControlledTextField = ({
  name,
  register,
  actionData,
  errors,
  defaultValue,
}: ControlledTextFieldProps): JSX.Element => {
  return (
    <TextField
      defaultValue={defaultValue}
      placeholder={name.charAt(0).toUpperCase() + name.slice(1)}
      {...register(name)}
      error={
        !!errors[name] || actionData?.error?.fieldError?.fieldErrors?.[name]
      }
      helperText={
        !!errors[name]
          ? errors[name]?.message
          : actionData?.error?.fieldError?.fieldErrors?.[name]
          ? actionData?.error?.fieldError?.fieldErrors?.[name]?.join(",")
          : null
      }
      sx={{ py: 1 }}
      fullWidth
    />
  );
};

export default ControlledTextField;
