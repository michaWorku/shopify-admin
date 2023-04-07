import {
  Box,
  Card,
  Grid,
  IconButton,
  Modal,
  Slide,
  Typography,
} from "@mui/material";
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
    control,
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

  const onSubmitHandler: SubmitHandler<clientInput> = (data) => {
    console.log({ data });
    fetcher.submit(
      { data: JSON.stringify(data) },
      {
        method: !editData?.id ? "post" : "patch",
        action: !editData?.id ? "clients" : `clients?clientId=${editData?.id}`,
      }
    );
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
                  py: 3
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
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
                      name="promotionText"
                      label="Promotion Text"
                      defaultValue={editData?.promotionText || ""}
                      control={control}
                      errors={errors["promotionText"]?.message}
                      placeholder="Promotion Text"
                      fullWidth
                      actionData={
                        actionData?.error?.fieldError?.fieldErrors[
                          "promotionText"
                        ]
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ControlledTextField
                      name="url"
                      label="URL"
                      defaultValue={editData?.url || ""}
                      control={control}
                      errors={errors["url"]?.message}
                      placeholder="URL"
                      fullWidth
                      actionData={
                        actionData?.error?.fieldError?.fieldErrors["url"]
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ControlledTextField
                      name="phone"
                      label="Phone"
                      defaultValue={editData?.phone || ""}
                      control={control}
                      errors={errors["phone"]?.message}
                      placeholder="Phone"
                      fullWidth
                      actionData={
                        actionData?.error?.fieldError?.fieldErrors["phone"]
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ControlledTextField
                      name="email"
                      label="Email"
                      defaultValue={editData?.email || ""}
                      control={control}
                      errors={errors["email"]?.message}
                      placeholder="Email"
                      fullWidth
                      actionData={
                        actionData?.error?.fieldError?.fieldErrors["email"]
                      }
                    />
                  </Grid>
                </Grid>
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
