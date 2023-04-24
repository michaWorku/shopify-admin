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
} from "@mui/material"
import { useLoaderData, useNavigate } from "@remix-run/react"
import moment from "moment"
import { Close } from "@mui/icons-material"
import palette from "../theme/palette"
export default function ViewUserDetail() {
  const navigate = useNavigate()
  const loaderData = useLoaderData()

  function onClose() {
    navigate(-1)
  }
  function UserData({ title, value }: { title: string; value: any }) {
    return (
      <Box sx={{ px: 2, py: 0.5, display: "flex" }}>
        <Box sx={{}}>
          <Typography>{title}</Typography>
        </Box>
        <Box sx={{ height: 32, borderRadius: "10px" }} border={"1px red bold"}>
          <Typography sx={{ pl: 2 }} variant="subtitle1">
            {value}
          </Typography>
        </Box>
      </Box>
    )
  }
  return (
    <Modal open={true} closeAfterTransition>
      <Slide in={true} direction="left">
        <Box
          sx={{
            position: "relative",
            float: "right",
          }}
          color={palette.primary.main}
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
              <Typography
                variant="h6"
                color={palette.primary.main}
                sx={{ fontWeight: "bold" }}
              >
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
              <Box sx={{ my: 2, bgcolor: "#f2f2f2" }}>
                <UserData
                  title="First Name"
                  value={loaderData?.data?.firstName}
                />

                <UserData
                  title="Last Name"
                  value={loaderData?.data?.lastName}
                />

                <UserData title="Email" value={loaderData?.data?.email} />

                <UserData
                  title="Phone Number"
                  value={loaderData?.data?.phone}
                />
                <UserData title="Gender" value={loaderData?.data?.gender} />

                <UserData
                  title="Birth Date"
                  value={moment(loaderData?.data?.birthDate).format("ll")}
                />
                <Box sx={{ px: 2 }}>
                  <Typography>Roles</Typography>
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
              </Box>
            </Box>
          </Card>
        </Box>
      </Slide>
    </Modal>
  )
}
