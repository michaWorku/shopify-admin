import { Box, Card, IconButton, Modal, Slide, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { Form } from "@remix-run/react";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect } from "react";
import { TypeOf } from "zod";
import { clientSchema } from "~/utils/schema/clientSchema";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Client } from "@prisma/client";
import { LoadingButton } from "@mui/lab";
import ControlledTextField from "./ControlledTextField";

type clientInput = TypeOf<typeof clientSchema>;

/**
 * Component for rendering a form for adding or editing a client.
 * @component ClientForm
 * @param {Object} props - The props object.
 * @param {boolean} props.openModal - Flag indicating if the modal is open.
 * @param {Object} props.actionData - Data related to the action being performed on the client.
 * @param {Object} props.editData - Data of the client being edited.
 * @param {Function} props.setActionData - Function to set the data related to the action being performed on the client.
 * @param {Function} props.setOpenModal - Function to set the state of the modal.
 * @param {Object} props.fetcher - Object for fetching data from API.
 * @returns {JSX.Element} JSX element containing the client form.
 */
const ClientForm = ({
  openModal,
  actionData,
  editData,
  setActionData,
  setOpenModal,
  fetcher,
}: any): JSX.Element => {
  const isAdding = !editData?.id;
  const isSubmittingOrLoading = ["submitting", "loading"].includes(
    fetcher.state
  );

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm<clientInput>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    console.log({ editData });
    ["name", "promotionText", "url", "email", "phone"].forEach((field: any) => {
      if (!!editData) setValue(field, editData[field as keyof Client]);
    });
  }, [editData]);

  const onSubmitHandler: SubmitHandler<clientInput> = (values) => {
    console.log({ values });
    fetcher.submit(values, {
      method: !editData?.id ? "post" : "patch",
      action: !editData?.id ? "client" : `client?clientId=${editData?.id}`,
    });
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    setActionData(null);
    reset();
  };

  return (
    <Modal open={openModal} onClose={handleCloseModal} closeAfterTransition>
      <Slide in={openModal} direction="left">
        <Box sx={{ position: "relative", float: "right" }}>
          <Card
            sx={{
              width: { xs: "100vw", sm: 400 },
              height: "100vh",
            }}
          >
            <Form onSubmit={handleSubmit(onSubmitHandler)}>
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
                    <Typography variant="h6">Add New Client</Typography>
                    <Typography>Add a new client</Typography>
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
                  height: "calc(100vh - 265px)",
                  px: 5,
                }}
              >
                <ControlledTextField
                  name="name"
                  register={register}
                  actionData={actionData}
                  errors={errors}
                  defaultValue={editData?.name}
                />
                <ControlledTextField
                  name="promotionText"
                  register={register}
                  actionData={actionData}
                  errors={errors}
                  defaultValue={editData?.promotionText}
                />
                <ControlledTextField
                  name="url"
                  register={register}
                  actionData={actionData}
                  errors={errors}
                  defaultValue={editData?.url}
                />
                <ControlledTextField
                  name="phone"
                  register={register}
                  actionData={actionData}
                  errors={errors}
                  defaultValue={editData?.phone}
                />
                <ControlledTextField
                  name="email"
                  register={register}
                  actionData={actionData}
                  errors={errors}
                  defaultValue={editData?.email}
                />
                {/* <TextField
          placeholder="Name * "
          sx={{ py: 1 }}
          fullWidth
          {...register("name")}
          error={
            !!errors["name"] || actionData?.error?.fieldError?.fieldErrors?.name
          }
          helperText={
            !!errors["name"]
              ? errors["name"]?.message
              : actionData?.error?.fieldError?.fieldErrors?.name
              ? actionData?.error?.fieldError?.fieldErrors?.name?.join(",")
              : null
          }
        /> 
        <TextField
          {...register("phone")}
          placeholder="Phone *"
          sx={{ py: 1 }}
          fullWidth
          error={
            !!errors["phone"] ||
            actionData?.error?.fieldError?.fieldErrors?.phone
          }
          helperText={
            !!errors["phone"]
              ? errors["phone"]?.message
              : actionData?.error?.fieldError?.fieldErrors?.phone
              ? actionData?.error?.fieldError?.fieldErrors?.phone?.join(",")
              : null
          }
        />
        <TextField
          placeholder="Email *"
          {...register("email")}
          sx={{ py: 1 }}
          fullWidth
          error={
            !!errors["email"] ||
            actionData?.error?.fieldError?.fieldErrors?.email
          }
          helperText={
            !!errors["email"]
              ? errors["email"]?.message
              : actionData?.error?.fieldError?.fieldErrors?.email
              ? actionData?.error?.fieldError?.fieldErrors?.email?.join(",")
              : null
          }
        />
        <TextField
          placeholder="Promotion Text * "
          {...register("promotionText")}
          sx={{ py: 1 }}
          fullWidth
          error={
            !!errors["promotionText"] ||
            actionData?.error?.fieldError?.fieldErrors?.promotionText
          }
          helperText={
            !!errors["promotionText"]
              ? errors["promotionText"]?.message
              : actionData?.error?.fieldError?.fieldErrors?.promotionText
              ? actionData?.error?.fieldError?.fieldErrors?.promotionText?.join(
                  ","
                )
              : null
          }
        />
        <TextField
          placeholder="url * "
          {...register("url")}
          sx={{ py: 1 }}
          fullWidth
          error={
            !!errors["url"] || actionData?.error?.fieldError?.fieldErrors?.url
          }
          helperText={
            !!errors["url"]
              ? errors["url"]?.message
              : actionData?.error?.fieldError?.fieldErrors?.url
              ? actionData?.error?.fieldError?.fieldErrors?.url?.join(", ")
              : null
          }
        />*/}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  position: "fixed",
                  bottom: 0,
                  width: { xs: "100vw", sm: 400 },
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
                  {isAdding
                    ? "Add Client"
                    : isSubmittingOrLoading
                    ? isAdding
                      ? "Adding..."
                      : "Updating..."
                    : "Update Client"}
                </LoadingButton>
              </Box>
            </Form>
          </Card>
        </Box>
      </Slide>
    </Modal>
  );
};

export default ClientForm;
