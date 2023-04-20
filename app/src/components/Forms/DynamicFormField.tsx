import type { FC} from "react";
import { useEffect } from "react";
import type { Control, SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { TypeOf, z } from "zod";
import SendIcon from "@mui/icons-material/Send";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Modal,
  Slide,
  Box,
  Card,
  Grid,
  Typography,
  IconButton,
  Chip,
  InputAdornment,
} from "@mui/material";

import { Controller } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, useLocation } from "@remix-run/react";
import { dynamicFormFieldSchema } from "~/utils/schema/dynamicFormSchema";
import ControlledTextField from "./ControlledTextField";

const FIELDOPTIONS = [
  "TEXT",
  "NUMBER",
  "EMAIL",
  "PHONE",
  "SELECT",
  "CHECKBOX",
  "RADIO",
  "TEXTAREA",
  "DATE",
];

type FieldFormProps = {
  field: any;
  control: Control<any>;
  errors: any;
  register: any;
  actionData?: any;
};

type DynamicFormFieldInput = TypeOf<typeof dynamicFormFieldSchema>;

/**
 * Field component displays a create or update an edit field
 * @component FieldForm
 * @param {object} props - props for FieldForm component
 * @param {object} props.field - field object
 * @param {object} props.control - react-hook-form controller
 * @param {object} props.errors - react-hook-form errors
 * @param {function} props.register - react-hook-form register function
 * @param {object} props.actionData - object containing action data
 * @returns {JSX.Element} - JSX element containing the form to add new field
 */
const FieldForm: FC<FieldFormProps> = ({
  field,
  control,
  errors,
  register,
  actionData,
}) => {
  return (
    <Grid
      container
      spacing={2}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <input type="hidden" {...register("id")} value={field?.id} />
      <Grid item xs={4}>
        <ControlledTextField
          name="name"
          label="Name"
          defaultValue={field?.name}
          control={control}
          required
          errors={errors["name"]?.message}
          actionData={actionData?.error?.fieldError?.fieldErrors["name"]}
          placeholder="Name"
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <ControlledTextField
          name="label"
          label="Label"
          defaultValue={field?.label}
          control={control}
          required
          errors={errors["label"]?.message}
          actionData={actionData?.error?.fieldError?.fieldErrors["label"]}
          placeholder="Label"
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <Controller
          name="type"
          control={control}
          defaultValue={field?.type ? field?.type : "TEXT"}
          render={({
            field: { value, ...fields },
            fieldState: { isDirty },
          }) => (
            <TextField
              {...fields}
              value={isDirty ? value : field?.type ? field?.type : "TEXT"}
              select
              label="Type"
              placeholder={field?.placeholder}
              variant="standard"
              required
              fullWidth
              helperText="Please select field type"
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
              {FIELDOPTIONS?.map((option: any) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Grid>
      <Grid item xs={12}>
        <ControlledTextField
          name="description"
          errors={errors["description"]?.message}
          actionData={actionData?.error?.fieldError?.fieldErrors["description"]}
          label="Description"
          defaultValue={field?.description}
          control={control}
          required
          fullWidth
          multiline
          minRows={2}
        />
      </Grid>
      <Grid item xs={4}>
        <ControlledTextField
          name="placeholder"
          label="Place holder"
          defaultValue={field?.placeholder}
          control={control}
          required
          errors={errors["placeholder"]?.message}
          actionData={actionData?.error?.fieldError?.fieldErrors["placeholder"]}
          placeholder="Place holder"
          fullWidth
        />
      </Grid>
      <Grid item xs={8}>
        <Controller
          name="options"
          control={control}
          defaultValue={field?.options}
          render={({ field: { value, onChange } }) => (
            <TextField
              variant="outlined"
              fullWidth
              label="Options"
              placeholder="Type and press enter to add a option"
              onKeyDown={(event: any) => {
                if (event.key === "Enter" && event.target.value) {
                  event.preventDefault();
                  event.stopPropagation();
                  event.nativeEvent.stopImmediatePropagation();
                  onChange([...value, event.target.value]);
                  event.target.value = "";
                }
              }}
              InputProps={{
                startAdornment: (
                  <>
                    {value?.map((option: any, index: number) => (
                      <Chip
                        key={index}
                        label={option}
                        onDelete={() => {
                          const newValues = [...value];
                          newValues.splice(index, 1);
                          onChange(newValues);
                        }}
                        style={{ margin: "4px" }}
                      />
                    ))}
                  </>
                ),
                endAdornment: (
                  <>
                    <InputAdornment position="end">
                      <ClearIcon
                        onClick={() => {
                          onChange([]);
                        }}
                      />
                    </InputAdornment>
                  </>
                ),
              }}
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
              }}
            />
          )}
        />
      </Grid>
      <Grid item xs={4}>
        <ControlledTextField
          name="defaultValue"
          label="Default Value"
          defaultValue={
            field?.defaultValue === 0 ? field?.index : field?.defaultValue
          }
          control={control}
          errors={errors["defaultValue"]?.message}
          actionData={
            actionData?.error?.fieldError?.fieldErrors["defaultValue"]
          }
          placeholder="Default Value"
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <ControlledTextField
          name="order"
          label="Order"
          defaultValue={field?.order === 0 ? field?.index : field?.order}
          control={control}
          required
          errors={errors["order"]?.message}
          actionData={actionData?.error?.fieldError?.fieldErrors["order"]}
          placeholder="Order"
          fullWidth
          type="number"
        />
      </Grid>
      <Grid item container xs={4}>
        <FormControlLabel
          control={
            <Checkbox
              {...register(`required`)}
              defaultChecked={field?.required}
            />
          }
          label="Required"
        />
      </Grid>
    </Grid>
  );
};

type DynamicFormField = z.infer<typeof dynamicFormFieldSchema>;

/**
 * A dynamic form field component to add, update, or delete form fields.
 * @component DynamicFormField
 * @param {Object} props - The props object
 * @param {Object} props.dynamicForm The schema for the dynamic form.
 * @param {Function} props.openModal A function that opens the modal component.
 * @param {Object} props.actionData The data for an action.
 * @param {Object} props.editData The data for an edit.
 * @param {Function} props.setEditData A function that sets the edit data.
 * @param {Function} props.setActionData A function that sets the action data.
 * @param {Function} props.setOpenModal A function that sets the open modal state.
 * @param {Object} props.fetcher A fetcher instance to handle API calls.
 * @returns {React.FC} A React functional component.
 */

const DynamicFormField: React.FC<any> = ({
  openModal,
  actionData,
  editData,
  setActionData,
  setOpenModal,
  fetcher,
  setEditData,
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
  } = useForm<DynamicFormField>({
    resolver: zodResolver(dynamicFormFieldSchema, undefined, {
      rawValues: true,
    }),
  });

  useEffect(() => {
    console.log({ editData });
    [
      "name",
      "label",
      "type",
      "description",
      "placeholder",
      "order",
      "required",
      "defaultValue",
      "options",
    ].forEach((field: any) => {
      if (editData)
        setValue(field, editData[field as keyof DynamicFormField]);
    });
  }, [editData]);

  const location = useLocation();

  const onSubmit:SubmitHandler<DynamicFormFieldInput> = (data) => {
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
    const formattedData = {
      ...data,
      name: data?.name
        ?.split(" ")
        .map((value: string, index: number) =>
          index ? value?.charAt(0).toUpperCase() + value.slice(1) : value
        )
        .join(""),
      label: data?.label
        ?.split(" ")
        .map(
          (value: string, index: number) =>
            value?.charAt(0).toUpperCase() + value.slice(1)
        )
        .join(" "),
      placeholder: data?.placeholder
        ?.split(" ")
        .map(
          (value: string, index: number) =>
            value?.charAt(0).toUpperCase() + value.slice(1)
        )
        .join(" "),
    };
    console.log({ data, formattedData });
    fetcher.submit(
      { data: JSON.stringify(formattedData) },
      {
        method: !editData?.id ? "post" : "patch",
        action: location.pathname,
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
              width: { xs: "100vw", sm: 800 },
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
                    <Typography variant="h6">Add New Form Field</Typography>
                    <Typography>Add a new Form Field</Typography>
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
                <FieldForm
                  field={editData}
                  control={control}
                  errors={errors}
                  actionData={actionData}
                  register={register}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  position: "fixed",
                  bottom: 0,
                  width: { xs: "100vw", sm: 800 },
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

export default DynamicFormField;
