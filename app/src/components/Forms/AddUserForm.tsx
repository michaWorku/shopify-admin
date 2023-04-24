import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormHelperText,
  CircularProgress,
  Modal,
  Slide,
  Card,
  Autocomplete,
} from "@mui/material"
import { pink, blue } from "@mui/material/colors"
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react"
import type { ChangeEvent, SyntheticEvent } from "react"
import { useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import { DesktopDatePicker } from "@mui/x-date-pickers"
import type { Dayjs } from "dayjs"
import moment from "moment"
export const GenderValue = ["MALE", "FEMALE"] as const

export default function AddUserForm({ openModal, closeModal, data }: any) {
  const transition = useNavigation()
  const actionData = useActionData()
  const submit = useSubmit()
  const date = moment().subtract(25, "years") as Dayjs
  const [values, setValues] = useState({}) as any
  const [birthDate, setBirthdate] = useState<Dayjs | null>(date)

  const handleBirthDateChange = (value: any) => {
    setBirthdate(value)
    values.birthDate = value
  }
  const handleRoleChange = (
    event: SyntheticEvent<Element, Event>,
    value: any
  ) => {
    event.preventDefault()
    const roleIds = value.map((item: any) => item.id)
    values.roleId = JSON.stringify(roleIds)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    setValues({ ...values, [event.target.name]: event.target.value })
  }

  function handleSubmit(event: any) {
    event.preventDefault()
    submit({ data: JSON.stringify(values) }, { method: "post" })
  }

  return (
    <Modal open={openModal} closeAfterTransition>
      <Slide in={openModal} direction="left">
        <Box sx={{ position: "relative", float: "right" }}>
          <Card
            sx={{
              width: { xs: "100vw", sm: 600 },
              height: "100vh",
            }}
          >
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
                  <Typography variant="subtitle1" gutterBottom>
                    Add New User
                  </Typography>
                  <Typography variant="body2">Add a new user</Typography>
                </Box>
                <Box
                  sx={{
                    pr: 5,
                    pt: 5,
                  }}
                >
                  <IconButton onClick={closeModal}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
            <Form encType="multipart/form-data" onSubmit={handleSubmit}>
              <Box
                sx={{
                  overflowY: "auto",
                  "&::-webkit-scrollbar": {
                    width: 0,
                  },
                  height: "calc(100vh - 265px)",
                  px: 5,
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
              >
                <TextField
                  label="First Name * "
                  name="firstName"
                  type="text"
                  sx={{
                    py: 1,
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
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  helperText={
                    actionData?.error?.fieldError &&
                    actionData?.error?.fieldError[0]?.fieldErrors?.firstName
                      ? actionData?.error?.fieldError[0]?.fieldErrors?.firstName?.join(
                          ","
                        )
                      : null
                  }
                  error={
                    actionData?.error?.fieldError &&
                    actionData?.error?.fieldError[0]?.fieldErrors?.firstName
                  }
                />
                <TextField
                  label="Middle Name"
                  name="middleName"
                  sx={{
                    py: 1,
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
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  helperText={
                    actionData?.error?.fieldError &&
                    actionData?.error?.fieldError[0]?.fieldErrors?.middleName
                      ? actionData?.error?.fieldError[0]?.fieldErrors?.middleName?.join(
                          ","
                        )
                      : null
                  }
                  error={
                    actionData?.error?.fieldError &&
                    actionData?.error?.fieldError[0]?.fieldErrors?.middleName
                  }
                />

                <TextField
                  name="lastName"
                  label="Last Name *"
                  sx={{
                    py: 1,
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
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  helperText={
                    actionData?.error?.fieldError &&
                    actionData?.error?.fieldError[0]?.fieldErrors?.lastName
                      ? actionData?.error?.fieldError[0]?.fieldErrors?.lastName?.join(
                          ","
                        )
                      : null
                  }
                  error={
                    actionData?.error?.fieldError &&
                    actionData?.error?.fieldError[0]?.fieldErrors?.lastName
                  }
                />
                <TextField
                  label="Email *"
                  name="email"
                  sx={{
                    py: 1,
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
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  helperText={
                    actionData?.error?.fieldError &&
                    actionData?.error?.fieldError[0]?.fieldErrors?.email
                      ? actionData?.error?.fieldError[0]?.fieldErrors?.email?.join(
                          ","
                        )
                      : null
                  }
                  error={
                    actionData?.error?.fieldError &&
                    actionData?.error?.fieldError[0]?.fieldErrors?.email
                  }
                />
                <TextField
                  label="password *"
                  name="password"
                  type="password"
                  sx={{
                    py: 1,
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
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  helperText={
                    actionData?.error?.fieldError &&
                    actionData?.error?.fieldError[0]?.fieldErrors?.password
                      ? actionData?.error?.fieldError[0]?.fieldErrors?.password?.join(
                          ","
                        )
                      : null
                  }
                  error={
                    actionData?.error?.fieldError &&
                    actionData?.error?.fieldError[0]?.fieldErrors?.password
                  }
                />
                <TextField
                  name="phone"
                  label="Phone Number *"
                  sx={{
                    py: 1,
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
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  helperText={
                    actionData?.error?.fieldError &&
                    actionData?.error?.fieldError[0]?.fieldErrors?.phone
                      ? actionData?.error?.fieldError[0]?.fieldErrors?.phone?.join(
                          ","
                        )
                      : null
                  }
                  error={
                    actionData?.error?.fieldError &&
                    actionData?.error?.fieldError[0]?.fieldErrors?.phone
                  }
                />
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={2}
                >
                  <DesktopDatePicker
                    label="Birthdate"
                    value={birthDate}
                    onChange={handleBirthDateChange}
                    //@ts-ignore
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        name="birthDate"
                        fullWidth
                        variant="filled"
                        helperText={
                          actionData?.error?.fieldError &&
                          actionData?.error?.fieldError[0]?.fieldErrors
                            ?.birthDate
                            ? actionData?.error?.fieldError[0]?.fieldErrors?.birthDate?.join(
                                ","
                              )
                            : null
                        }
                        error={
                          actionData?.error?.fieldError &&
                          actionData?.error?.fieldError[0]?.fieldErrors
                            ?.birthDate
                        }
                      />
                    )}
                  />
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <FormLabel id="demo-row-radio-buttons-group-label">
                    Gender *
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="gender"
                    onChange={handleChange}
                  >
                    <FormControlLabel
                      value={GenderValue[1]}
                      control={<Radio />}
                      label="Female"
                      sx={{
                        "&.Mui-checked": {
                          color: pink[600],
                        },
                      }}
                    />
                    <FormControlLabel
                      value={GenderValue[0]}
                      control={<Radio />}
                      label="Male"
                      sx={{
                        "&.Mui-checked": {
                          color: blue[600],
                        },
                      }}
                    />
                  </RadioGroup>
                  <FormHelperText sx={{ color: "red", mb: 2, pl: 2 }}>
                    {actionData?.error?.fieldError &&
                    actionData?.error?.fieldError[0]?.fieldErrors?.gender
                      ? actionData?.error?.fieldError[0]?.fieldErrors?.gender?.join(
                          ","
                        )
                      : null}
                  </FormHelperText>
                </Box>
                <Box
                  width="50%"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={2}
                >
                  <Autocomplete
                    multiple
                    id="tags-filled"
                    fullWidth
                    onChange={(event, newValue) =>
                      handleRoleChange(event, newValue)
                    }
                    filterSelectedOptions
                    options={data?.data?.userRoles || data?.data?.roles || []}
                    getOptionLabel={(option: any) => option?.name}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Role"
                        helperText={
                          actionData?.error?.fieldError &&
                          actionData?.error?.fieldError[0]?.fieldErrors?.roleId
                            ? actionData?.error?.fieldError[0]?.fieldErrors?.roleId?.join(
                                ","
                              )
                            : null
                        }
                        error={
                          actionData?.error?.fieldError &&
                          actionData?.error?.fieldError[0]?.fieldErrors?.roleId
                        }
                      />
                    )}
                  />
                </Box>
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
                <Button type="submit" variant="add" color="success">
                  {transition.formAction ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        m: 1,
                      }}
                    >
                      <CircularProgress
                        size={24}
                        color="primary"
                        sx={{ mr: 2 }}
                      />
                      <Typography color="white">Saving...</Typography>
                    </Box>
                  ) : (
                    <Typography color="white">Add User</Typography>
                  )}
                </Button>
              </Box>
            </Form>
          </Card>
        </Box>
      </Slide>
    </Modal>
  )
}
