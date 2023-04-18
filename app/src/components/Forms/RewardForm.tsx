import type { FC} from "react";
import { useEffect } from "react";
import type { Control } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import {
  TextField,
  MenuItem,
  Modal,
  Slide,
  Box,
  Card,
  Grid,
  Typography,
  IconButton,
  Autocomplete,
} from "@mui/material";

import { Controller } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, useLocation } from "@remix-run/react";
import { Reward } from "@prisma/client";
import { rewardSchema } from "~/utils/schema/rewardSchema";

const PLANOPTIONS = ["DAY", "WEEK", "MONTH", "YEAR"];

type RewardProps = {
  reward: any;
  control: Control<any>;
  errors: any;
  register: any;
  actionData?: any;
  forms?: any;
};
/**
 * Reward component displays a reward form
 * @component Reward
 * @param {object} props - props for Reward component
 * @param {object} props.field - field object
 * @param {object} props.control - react-hook-form controller
 * @param {object} props.errors - react-hook-form errors
 * @param {function} props.register - react-hook-form register function
 * @param {object} props.actionData - object containing action data
 * @returns {JSX.Element} - JSX element containing the form to add new field
 */
const Reward: FC<RewardProps> = ({
  reward,
  control,
  errors,
  register,
  actionData,
  forms,
}) => {
  return (
    <Grid
      container
      spacing={2}
      display="flex"
      alignItems="center"
      justifyContent="start"
      mt={1}
    >
      <input type="hidden" {...register("id")} value={reward?.id} />
      <Grid item xs={6}>
        <ControlledTextField
          name="name"
          label="Name"
          defaultValue={reward?.name}
          control={control}
          required
          errors={errors["name"]?.message}
          actionData={actionData?.error?.fieldError?.fieldErrors["name"]}
          placeholder="Name"
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <Controller
          name="formId"
          control={control}
          defaultValue={reward?.formId}
          render={({ field: { onChange, value }, fieldState: { isDirty } }) => (
            <Autocomplete
              id="formId"
              disableClearable
              value={forms?.find((form: any) => form?.id === reward?.formId)?.name || value}
              options={forms?.map((option: any) => option?.name)}
              onChange={(event, value: any) =>
                onChange(forms?.find((form: any) => form?.name === value)?.id)
              }
              placeholder="Search form"
              sx={{
                '& .MuiFormLabel-root':{
                  color: 'primary.main'
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Form"
                  placeholder="Search Form"
                  required
                  InputProps={{
                    ...params.InputProps,
                    type: "search"
                  }}
                  error={
                    !!errors["formId"] ||
                    actionData?.error?.fieldError?.fieldErrors?.["formId"]
                  }
                  helperText={
                    errors["formId"]
                      ? errors["formId"]?.message
                      : actionData?.error?.fieldError?.fieldErrors?.["formId"]
                      ? actionData?.error?.fieldError?.fieldErrors?.[
                          "formId"
                        ]?.join(",")
                      : null
                  }
                />
              )}
            />
          )}
        />
      </Grid>
      <Grid item xs={12}>
        <ControlledTextField
          name="description"
          errors={errors["description"]?.message}
          actionData={actionData?.error?.fieldError?.fieldErrors["description"]}
          label="Description"
          defaultValue={reward?.description}
          control={control}
          required
          fullWidth
          multiline
          minRows={2}
        />
      </Grid>
      <Grid item xs={6}>
        <Controller
          name="plan"
          control={control}
          defaultValue={reward?.plan ? reward?.plan : "DAY"}
          render={({
            field: { value, ...fields },
            fieldState: { isDirty },
          }) => (
            <TextField
              {...fields}
              value={isDirty ? value : reward?.plan ? reward?.plan : "DAY"}
              select
              label="Plan"
              placeholder={reward?.placeholder}
              variant="standard"
              required
              fullWidth
              helperText="Please select field plan"
              sx={{
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
              {PLANOPTIONS?.map((option: any) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Grid>
      <Grid item xs={6}>
        <ControlledTextField
          name="rewardGiven"
          label="Reward Given"
          defaultValue={reward?.rewardGiven}
          control={control}
          required
          errors={errors["rewardGiven"]?.message}
          actionData={actionData?.error?.fieldError?.fieldErrors["rewardGiven"]}
          placeholder="Reward Given"
          fullWidth
          type="number"
        />
      </Grid>
    </Grid>
  );
};

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
              errors ? errors : actionData ? actionData.join(" ") : null
            }
            {...props}
            sx={{
              "& .MuiTextField-root": { my: 1 },
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

/**
 * A Reward form component to create, update reward.
 * @component RewardForm
 * @param {Object} props - The props object
 * @param {Object} props.rewardForm The schema for the dynamic form.
 * @param {Function} props.openModal A function that opens the modal component.
 * @param {Object} props.actionData The data for an action.
 * @param {Object} props.editData The data for an edit.
 * @param {Function} props.setEditData A function that sets the edit data.
 * @param {Function} props.setActionData A function that sets the action data.
 * @param {Function} props.setOpenModal A function that sets the open modal state.
 * @param {Object} props.fetcher A fetcher instance to handle API calls.
 * @param {Object} props.forms A form data
 * @returns {React.FC} A React functional component.
 */

const RewardForm: React.FC<any> = ({
  openModal,
  actionData,
  editData,
  setActionData,
  setOpenModal,
  fetcher,
  setEditData,
  forms,
}) => {
  const isSubmittingOrLoading = ["submitting", "loading"].includes(
    fetcher.state
  );

  const {
    control,
    handleSubmit,
    register,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<Reward>({
    mode: "onChange",
    resolver: zodResolver(rewardSchema, undefined, {
      rawValues: true,
    }),
  });

  useEffect(() => {
    console.log({ editData });
    ["name", "formId", "description", "plan", "rewardGiven"].forEach(
      (field: any) => {
        if (editData) setValue(field, editData[field as keyof Reward]);
      }
    );
  }, [editData]);

  const location = useLocation();

  const onSubmit = (data: any) => {
    // const test = {
    //   name: "",
    //   description: "",
    //   fields: [
    //     {
    //       id: "87f8e941-c866-4eec-b109-7d2290ba562b",
    //       required: false,
    //       name: "f",
    //       label: "",
    //       type: "TEX",
    //       description: "first name",
    //       placeholder: "first name",
    //       defaultValue: "",
    //       order: 2,
    //     },
    //   ],
    // };
    console.log({ data });
    fetcher.submit(
      { data: JSON.stringify(data) },
      {
        method: !editData?.id ? "post" : "patch",
        action: !editData?.id
          ? location.pathname
          : `${location.pathname}?rewardId=${editData?.id}`,
      }
    );
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setActionData(null);
    setEditData(null);
    reset();
  };

  return (
    <Modal open={openModal} onClose={handleCloseModal} closeAfterTransition>
      <Slide in={openModal} direction="left">
        <Box sx={{ position: "relative", float: "right" }}>
          <Card
            sx={{
              width: { xs: "100vw", sm: 600 },
              height: "100vh",
            }}
          >
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Box
                sx={{
                  height: { xs: 150, sm: 135 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ px: 5, pt: 5 }}>
                    <Typography variant="h6">Add New Reward</Typography>
                    <Typography>Add a new Reward</Typography>
                  </Box>

                  <Box
                    sx={{
                      pr: 5,
                      pt: 5,
                    }}
                  >
                    <IconButton onClick={handleCloseModal}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  overflowY: "auto",
                  "&::-webkit-scrollbar": {
                    width: 0,
                  },
                  height: "calc(100vh - 240px)",
                  px: 5,
                  pt: 0.5,
                }}
              >
                <Reward
                  reward={editData}
                  control={control}
                  errors={errors}
                  actionData={actionData}
                  register={register}
                  forms={forms}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  position: "fixed",
                  bottom: 0,
                  width: { xs: "100vw", sm: 600 },
                  height: 80,
                  p: 3,
                  bgcolor: "#F5F5F5",
                }}
              >
                <LoadingButton
                  size="large"
                  endIcon={<SendIcon sx={{ visibility: "hidden" }} />}
                  loading={
                    fetcher.state === "submitting" ||
                    fetcher.state === "loading"
                  }
                  loadingPosition="end"
                  variant="add"
                  type="submit"
                  sx={{
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
                  {isSubmittingOrLoading ? "Submitting..." : "Submit"}
                </LoadingButton>
              </Box>
            </Form>
          </Card>
        </Box>
      </Slide>
    </Modal>
  );
};

export default RewardForm;
