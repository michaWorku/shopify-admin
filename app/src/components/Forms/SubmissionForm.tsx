import { Controller, useForm } from "react-hook-form";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  InputLabel,
  Box,
  Grid,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DynamicFormFieldType } from "@prisma/client";
import SendIcon from "@mui/icons-material/Send";
import { Form, useLocation, useParams } from "@remix-run/react";
import { LoadingButton } from "@mui/lab";

/**
 * Dynamic form input
 * @typedef {Object} DynamicFormInputProps
 * @property {Object} field - The dynamic form field object.
 * @property {function} register - The `register` function from `react-hook-form`.
 * @property {Object} control - The `control` object from `react-hook-form`.
 * @property {Object} errors - The errors object from `react-hook-form`.
 * @property {Array} actionData - An array of error messages generated by the form submission.
 * @property {Object} submitedData - An object containing the default values of the form fields.
 *
 * @param {DynamicFormInputProps} props - The props object containing the props listed above.
 *
 * @returns {JSX.Element} - A JSX element that renders a dynamic form input based on the provided field object.
 */
const DynamicFormInput = ({
  field,
  register,
  control,
  errors,
  actionData,
  submitedData = {},
}: any) => {
  switch (field.type) {
    case DynamicFormFieldType.TEXT:
    case DynamicFormFieldType.NUMBER:
    case DynamicFormFieldType.EMAIL:
    case DynamicFormFieldType.PHONE:
    case DynamicFormFieldType.TEXTAREA:
      return (
        <TextField
          {...register(field?.name, {
            required: field?.required,
            pattern:
              field.type === DynamicFormFieldType.NUMBER
                ? /^[0-9]*$/
                : field.type === DynamicFormFieldType.EMAIL
                ? /^\S+@\S+$/i
                : field.type === DynamicFormFieldType.PHONE
                ? /^[0-9]*$/
                : /^[a-zA-Z\s]*$/,
            minLength: { value: 2, message: `${field?.name} is too short` },
            valueAsNumber: field.type === DynamicFormFieldType.NUMBER,
          })}
          label={field?.label}
          placeholder={field?.placeholder}
          type={
            field.type === DynamicFormFieldType.PHONE
              ? "tel"
              : field?.type || "text"
          }
          defaultValue={submitedData[field?.name]}
          multiline={field?.type === DynamicFormFieldType.TEXTAREA}
          minRows={field?.type === DynamicFormFieldType.TEXTAREA ? 3 : 1}
          error={!!errors || !!actionData}
          helperText={
            errors ? errors : actionData ? actionData.join(" ") : null
          }
          sx={{
            width: {
              xs: "18rem",
              sm: "14rem",
              md:
                field?.type === DynamicFormFieldType.TEXTAREA ? "100%" : "80%",
            },

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
          }}
        />
      );
    case DynamicFormFieldType.SELECT:
      return (
        <TextField
          {...register(field?.name, {
            required: field?.required,
          })}
          select
          label={field?.label}
          placeholder={field?.placeholder}
          defaultValue={submitedData[field?.name] || field?.defaultValue}
          variant="standard"
          error={!!errors || !!actionData}
          helperText={
            errors ? errors : actionData ? actionData.join(" ") : null
          }
          sx={{
            width: {
              xs: "18rem",
              sm: "14rem",
              md:
                field?.type === DynamicFormFieldType.TEXTAREA ? "100%" : "80%",
            },
            "& legend": { display: "none" },
            "& fieldset": { top: 0 },
            "& .MuiSelect-select": {
              font: "normal normal normal 16px/39px Roboto",
              pl: 1.5,
              bgcolor: "#f5f5f5",
              border: "1px solid #fff",
              borderRadius: "5px 5px 0px 0px",
              color: "primary.main",
            },
          }}
        >
          {field.options?.map((option: any) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      );
    case DynamicFormFieldType.CHECKBOX:
      return (
        <FormControl>
          <FormControlLabel
            control={
              <Controller
                name={field?.name}
                control={control}
                rules={{ required: field.required }}
                defaultValue={
                  submitedData[field?.name] || field.defaultValue || false
                }
                render={({ field }) => <Checkbox {...field} />}
              />
            }
            label={field?.label}
          />
          {(!!errors || !!actionData) && (
            <FormHelperText>
              {errors ? errors : actionData ? actionData.join(" ") : null}
            </FormHelperText>
          )}
        </FormControl>
      );
    case DynamicFormFieldType.RADIO:
      return (
        <Controller
          name={field?.name}
          control={control}
          rules={{ required: field.required }}
          defaultValue={submitedData[field?.name] || field.defaultValue || ""}
          render={({ field: fields }) => (
            <FormControl
              sx={{
                "& .MuiFormLabel-root": {
                  color: "primary.main",
                },
                "& .MuiSvgIcon-root": {
                  fontSize: 28,
                  color: "primary.main",
                },
              }}
            >
              <FormLabel id={field?.id}>{field?.label}</FormLabel>
              <RadioGroup {...fields}>
                {field?.options?.map((option: any) => (
                  <FormControlLabel
                    key={option}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
        />
      );
    case DynamicFormFieldType.DATE:
      return (
        <Controller
          name={field.name}
          control={control}
          rules={{ required: field.required }}
          defaultValue={
            submitedData[field?.name]
              ? new Date(submitedData[field?.name])
              : field.defaultValue
              ? new Date(field.defaultValue)
              : null
          }
          render={({ field: fields }) => (
            <Box>
              <InputLabel
                sx={{
                  my: 0.5,
                  color: "primary.main",
                  font: "normal normal 900 14px Roboto",
                }}
              >
                {field?.label}
              </InputLabel>
              <DatePicker
                disableFuture
                openTo="month"
                views={["year", "month", "day"]}
                value={fields?.value}
                onChange={(newValue: any) => {
                  fields?.onChange(newValue);
                }}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    name={field?.name}
                    InputLabelProps={{ shrink: false }}
                    error={!!errors || !!actionData}
                    helperText={
                      errors
                        ? errors
                        : actionData
                        ? actionData.join(" ")
                        : null
                    }
                    sx={{
                      width: {
                        xs: "18rem",
                        sm: "14rem",
                        md:
                          field?.type === DynamicFormFieldType.TEXTAREA
                            ? "100%"
                            : "80%",
                      },
                      "& .MuiInputBase-root": {
                        height: "3.3rem",
                        color: "primary.main",
                        font: "normal normal normal 20px Roboto",
                        bgcolor: "#f5f5f5",
                        border: "1px solid #fff",
                        borderBottom: "1px solid #000",
                        borderRadius: "5px 5px 0px 0px",
                        outline: "none",
                        outlineColor: "#fff",
                      },
                      svg: {
                        color: "primary.main",
                        width: "30px",
                        height: "30px",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        outline: "none",
                        border: "none",
                      },
                    }}
                  />
                )}
              />
            </Box>
          )}
        />
      );
    default:
      return null;
  }
};

/**
 * A form component for submitting data.
 * @param {Object} props - The component props.
 * @param {Object} props.actionData - Data related to the form submission action.
 * @param {Object} props.fetcher - An object for fetching data.
 * @param {Object} props.loaderData - Data related to loading the form.
 * @params {Object} props.navigation - The route navigation data
 * @returns {JSX.Element} - The rendered component.
 */
const SubmissionForm: React.FC<any> = ({
  actionData,
  fetcher,
  loaderData,
  navigation,
}) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const location = useLocation();
  const params = useParams();

  const onSubmit = (data: any) => {
    console.log({ data, params });
    fetcher.submit(
      { data: JSON.stringify({ submitedData: data, phone: params?.phone }) },
      {
        method: "post",
        action: location?.pathname,
      }
    );
  };

  return (
    <Box>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h6" my={1}>
          {loaderData?.client?.name
            ?.split(" ")
            ?.map(
              (value: string, index: number) =>
                value?.charAt(0).toUpperCase() + value.slice(1)
            )
            .join(" ")}
        </Typography>
        <Typography variant="body1" mt={2} mb={4}>
          {loaderData?.client?.promotionText}
        </Typography>
        <Grid
          container
          spacing={2}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: { xs: "center", sm: "start" },
            alignItems: { xs: "start", sm: "center" },
          }}
        >
          {loaderData?.form?.fields
            ?.sort((a: any, b: any) => a.order - b.order)
            .map((field: any, index: number) => (
              <Grid item xs={12} sm={6} md={4} key={field.name}>
                <DynamicFormInput
                  field={field}
                  control={control}
                  register={register}
                  errors={errors[field?.name]?.message}
                  submitedData={
                    fetcher?.data?.submitedData ||
                    fetcher?.data?.data?.submitedData
                  }
                  actionData={
                    actionData?.error?.fieldError?.fieldErrors[field?.name]
                  }
                />
              </Grid>
            ))}
        </Grid>
        <br />
        <LoadingButton
          size="large"
          endIcon={<SendIcon sx={{ visibility: "hidden" }} />}
          loading={
            fetcher.state === "submitting" || navigation.state === "loading"
          }
          loadingPosition="end"
          type="submit"
          variant="add"
          {...register("submit")}
          value={
            fetcher?.data?.data?.submissionId
              ? fetcher?.data?.data?.submissionId
              : "1"
          }
          sx={{
            my: 2,
            background: "#601E1D",
            color: "#fff",
            ":hover": {
              background: "#3D0505",
            },
            "&.MuiLoadingButton-root": {
              color: "white",
              display: "flex",
              justifyContent: "end",
            },
          }}
        >
          {fetcher.state === "submitting" || navigation.state === "loading"
            ? "Submitting..."
            : "Submit"}
        </LoadingButton>
      </Form>
    </Box>
  );
};

export default SubmissionForm;
