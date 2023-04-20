import type { FC} from "react";
import { useEffect, useState } from "react";
import type { Control, SubmitHandler } from "react-hook-form";
import { useForm, useFieldArray } from "react-hook-form";
import type { TypeOf, z } from "zod";
import ClearIcon from "@mui/icons-material/Clear";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Button,
  Modal,
  Slide,
  Box,
  Card,
  Grid,
  Divider,
  Typography,
  IconButton,
  InputAdornment,
  Chip,
} from "@mui/material";

import { Controller } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, useLocation } from "@remix-run/react";
import {
  dynamicFormFieldSchema,
  dynamicFormSchema,
} from "~/utils/schema/dynamicFormSchema";
import { flattenErrors } from "~/utils/validators/validate";
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

type AddFieldProps = {
  field: any;
  control: Control<any>;
  errors: any;
  register: any;
  remove: (index: number) => void;
  actionData?: any;
  length: number;
};
type DynamicFormInput = TypeOf<typeof dynamicFormSchema>;

/**
 * AddField component displays a form to add new field
 * @component AddField
 * @param {object} props - props for AddField component
 * @param {object} props.field - field object
 * @param {object} props.control - react-hook-form controller
 * @param {object} props.errors - react-hook-form errors
 * @param {function} props.register - react-hook-form register function
 * @param {function} props.remove - function to remove field
 * @param {object} props.actionData - object containing action data
 * @param {number} props.length - lenght of the fields
 * @returns {JSX.Element} - JSX element containing the form to add new field
 */
const AddField: FC<AddFieldProps> = ({
  field,
  control,
  errors,
  register,
  remove,
  actionData,
  length,
}) => {
  return (
    <Grid
      container
      spacing={2}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <input
        type="hidden"
        {...register(`fields.${field?.index}.id`)}
        value={field?.id}
      />
      {length > 1 && (
        <Grid item xs={12} display="flex" justifyContent="flex-end">
          <Button
            type="button"
            variant="text"
            sx={{
              color: "#000",
              ":hover": {
                color: "#000",
              },
            }}
            onClick={() => remove(field?.index)}
            startIcon={<RemoveCircleIcon />}
          >
            Delete Field
          </Button>
        </Grid>
      )}
      <Grid item xs={4}>
        <ControlledTextField
          name={`fields.${field?.index}.name`}
          label="Name"
          defaultValue={field?.name}
          control={control}
          required
          errors={
            flattenErrors({ ...errors })[`fields.${field?.index}.name.message`]
          }
          actionData={
            actionData?.error?.fieldError?.formatted[
              `fields.${field?.index}.name`
            ]?._errors
          }
          placeholder="Name"
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <ControlledTextField
          name={`fields.${field?.index}.label`}
          label="Label"
          defaultValue={field?.label}
          control={control}
          required
          errors={
            flattenErrors({ ...errors })[`fields.${field?.index}.label.message`]
          }
          actionData={
            actionData?.error?.fieldError?.formatted[
              `fields.${field?.index}.label`
            ]?._errors
          }
          placeholder="Label"
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <Controller
          name={`fields.${field?.index}.type`}
          control={control}
          defaultValue={field?.type}
          render={({
            field: { value, ...fields },
            fieldState: { isDirty },
          }) => (
            <TextField
              {...fields}
              value={isDirty ? value : field?.type}
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
          name={`fields.${field?.index}.description`}
          actionData={
            actionData?.error?.fieldError?.formatted[
              `fields.${field?.index}.description`
            ]?._errors
          }
          label="Description"
          defaultValue={field?.description}
          control={control}
          required
          errors={
            flattenErrors({ ...errors })[
              `fields.${field?.index}.description.message`
            ]
          }
          fullWidth
          multiline
          minRows={2}
        />
      </Grid>
      <Grid item xs={4}>
        <ControlledTextField
          name={`fields.${field?.index}.placeholder`}
          label="Place holder"
          defaultValue={field?.placeholder}
          control={control}
          required
          errors={
            flattenErrors({ ...errors })[
              `fields.${field?.index}.placeholder.message`
            ]
          }
          actionData={
            actionData?.error?.fieldError?.formatted[
              `fields.${field?.index}.placeholder`
            ]?._errors
          }
          placeholder="Place holder"
          fullWidth
        />
      </Grid>
      <Grid item xs={8}>
        <Controller
          name={`fields.${field?.index}.options`}
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
          name={`fields.${field?.index}.defaultValue`}
          label="Default Value"
          defaultValue={
            field?.defaultValue === 0 ? field?.index : field?.defaultValue
          }
          control={control}
          errors={
            flattenErrors({ ...errors })[
              `fields.${field?.index}.defaultValue.message`
            ]
          }
          actionData={
            actionData?.error?.fieldError?.formatted[
              `fields.${field?.index}.defaultValue`
            ]?._errors
          }
          placeholder="Default Value"
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <ControlledTextField
          name={`fields.${field?.index}.order`}
          label="Order"
          defaultValue={field?.order === 0 ? field?.index : field?.order}
          control={control}
          required
          errors={
            flattenErrors({ ...errors })[`fields.${field?.index}.order.message`]
          }
          actionData={
            actionData?.error?.fieldError?.formatted[
              `fields.${field?.index}.order`
            ]?._errors
          }
          placeholder="Order"
          fullWidth
          type="number"
        />
      </Grid>
      <Grid item container xs={4}>
        <FormControlLabel
          control={
            <Checkbox
              {...register(`fields.${field?.index}.required`)}
              defaultChecked={field?.required}
            />
          }
          label="Required"
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

type DynamicForm = z.infer<typeof dynamicFormSchema>;

type DynamicFormField = z.infer<typeof dynamicFormFieldSchema>;

const defaultFormFields = [
  {
    name: "",
    label: "",
    type: "TEXT",
    defaultValue: "",
    required: true,
    placeholder: "",
    description: "",
    order: 1 as number,
    options: [],
  },
] as DynamicFormField[];

/**
 * A dynamic form component to add, update, or delete form fields.
 * @component DynamicForm
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

const DynamicForm: React.FC<any> = ({
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
    formState: { errors },
    reset,
    setValue,
    
  } = useForm<DynamicForm>({
    resolver: zodResolver(dynamicFormSchema, undefined, {
      rawValues: true,
    }),
  });

  useEffect(() => {
    console.log({ editData });
    ["name", "description", "fields"].forEach((field: any) => {
      if (editData) setValue(field, editData[field as keyof DynamicForm]);
    });
    if (!editData) {
      setValue("name", "");
      setValue("description", "");
      setValue("fields", defaultFormFields);
    }
  }, [editData]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  const addFormField = () => {
    append({
      id: "",
      name: "",
      label: "",
      type: "TEXT",
      defaultValue: "",
      required: true,
      placeholder: "",
      description: "",
      order: (fields.length + 1) as number,
      options: [],
    });
  };

  const onSubmit: SubmitHandler<DynamicFormInput> = (data) => {
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
    let formatedData = {
      name: data?.name,
      description: data?.description,
      fields: data?.fields.map((field: any) => ({
        ...field,
        name: field?.name
          ?.split(" ")
          .map((value: string, index: number) =>
            index ? value?.charAt(0).toUpperCase() + value.slice(1) : value
          )
          .join(""),
        label: field?.label
          ?.split(" ")
          .map(
            (value: string, index: number) =>
              value?.charAt(0).toUpperCase() + value.slice(1)
          )
          .join(" "),
        placeholder: field?.placeholder
          ?.split(" ")
          .map(
            (value: string, index: number) =>
              value?.charAt(0).toUpperCase() + value.slice(1)
          )
          .join(" "),
      })),
    };
    console.log({ data, formatedData });
    fetcher.submit(
      { data: JSON.stringify(formatedData) },
      {
        method: !editData?.id ? "post" : "patch",
        action: !editData?.id
          ? location.pathname
          : `${location.pathname}?formId=${editData?.id}`,
      }
    );
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setActionData(null);
    setEditData(null);
    reset();
    remove();
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
                    <Typography variant="h6">Add New Form</Typography>
                    <Typography variant="body1">Add a new Form</Typography>
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
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <ControlledTextField
                      name="name"
                      label="Name"
                      defaultValue={editData?.name || ""}
                      control={control}
                      errors={errors["name"]?.message}
                      placeholder="Name"
                      fullWidth
                      actionData={
                        actionData?.error?.fieldError?.fieldErrors["name"]
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ControlledTextField
                      name="description"
                      label="Description"
                      defaultValue={editData?.description || ""}
                      control={control}
                      errors={errors["description"]?.message}
                      placeholder="Description"
                      fullWidth
                      multiline
                      minRows={2}
                      actionData={
                        actionData?.error?.fieldError?.fieldErrors[
                          "description"
                        ]
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                </Grid>

                {fields
                  ?.sort((a: any, b: any) => a.order - b.order)
                  ?.map((field: any, index: number) => (
                    <Box key={field.id + index}>
                      {!!index && <Divider sx={{ my: 1.5 }} />}
                      <AddField
                        key={field.id + index}
                        field={{ ...field, index }}
                        control={control}
                        errors={errors}
                        actionData={actionData}
                        register={register}
                        remove={remove}
                        length={fields?.length}
                      />
                    </Box>
                  ))}
                <Grid
                  item
                  xs={12}
                  display="flex"
                  justifyContent="flex-end"
                  mt={1}
                  mr={2}
                >
                  <Button
                    type="button"
                    variant="text"
                    onClick={addFormField}
                    startIcon={<AddCircleIcon />}
                  >
                    Add Field
                  </Button>
                </Grid>
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

export default DynamicForm;
