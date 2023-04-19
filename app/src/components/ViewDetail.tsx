import {
  Modal,
  Box,
  Card,
  Typography,
  IconButton,
  Divider,
  Grid,
  Slide,
  Avatar,
  Chip,
} from "@mui/material";
import { useLoaderData, useNavigate } from "@remix-run/react";
import moment from "moment";
import { Close } from "@mui/icons-material";
export default function ViewUserDetail() {
  const navigate = useNavigate();
  const loaderData = useLoaderData();

  function onClose() {
    navigate(-1);
  }
  function UserData({ title, value }: { title: string; value: any }) {
    return (
      <Box sx={{ px: 2 }}>
        <Typography variant="overline">{title}</Typography>
        <Box sx={{ bgcolor: "#FAFAFA", py: 0.5, height: 32 }}>
          <Typography sx={{ fontWeight: "bold", pl: 2 }}>{value}</Typography>
        </Box>
      </Box>
    );
  }
  return (
    <Modal open={true} closeAfterTransition>
      <Slide in={true} direction="left">
        <Box
          sx={{
            position: "relative",
            float: "right",
          }}
        >
          <Card
            sx={{
              width: { xs: "100vw", sm: 500 },
              height: "100vh",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mx: 3,
                my: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                User Detail
              </Typography>
              <IconButton onClick={onClose}>
                <Close />
              </IconButton>
            </Box>
            <Divider />
            <Box
              sx={{
                p: 3,
                height: "calc(100vh - 100px)",
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  width: 0,
                },
              }}
            >
              <Grid container sx={{ my: 2 }}>
                <Grid item xs={6}>
                  <UserData
                    title="First Name"
                    value={loaderData?.data?.firstName}
                  />
                  <UserData
                    title="Last Name"
                    value={loaderData?.data?.lastName}
                  />
                </Grid>
              </Grid>
              <Grid container sx={{ my: 2 }}>
                <Grid item xs={6}>
                  <UserData title="Email" value={loaderData?.data?.email} />
                </Grid>
                <Grid item xs={6}>
                  <UserData
                    title="Phone Number"
                    value={loaderData?.data?.phone}
                  />
                </Grid>
              </Grid>
              <Grid container sx={{ my: 2 }}>
                <Grid item xs={6}>
                  <UserData title="Gender" value={loaderData?.data?.gender} />
                </Grid>
                <Grid item xs={6}>
                  <UserData
                    title="Birth Date"
                    value={moment(loaderData?.data?.birthDate).format("ll")}
                  />
                </Grid>
              </Grid>
              <Divider />
              <Grid container sx={{ my: 2 }}>
                <Grid item xs={6}>
                  <Box sx={{ px: 2 }}>
                    <Typography variant="overline">Roles</Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      {loaderData?.data?.roles?.map((item: any) => (
                        <Chip label={item?.name} />
                      ))}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <UserData title="Status" value={loaderData?.data?.status} />
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Box>
      </Slide>
    </Modal>
  );
}
