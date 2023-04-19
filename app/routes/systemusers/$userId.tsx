import {
    Modal,
    Box,
    Card,
    Slide,
    Typography,
    TextField,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormHelperText,
    Autocomplete,
    Button,
    CircularProgress,
    IconButton,
} from '@mui/material'
import { pink, blue } from '@mui/material/colors'
import type { ActionFunction, LoaderFunction} from '@remix-run/server-runtime';
import { json } from '@remix-run/server-runtime'
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs'
import type { SyntheticEvent, ChangeEvent} from 'react';
import { useState, useEffect } from 'react'
import {
    Form,
    useActionData,
    useSubmit,
    useLoaderData,
    useNavigate,
    useNavigation,
    useSearchParams,
} from '@remix-run/react'
import Close from '@mui/icons-material/Close'
import {
    deleteSystemUser,
    updateSystemUser,
} from '~/services/User/systemuser.server'
import { authenticator } from '~/services/auth.server'
import { GenderValue } from '~/src/components/Forms/AddUserForm'
import { Response, errorHandler } from '~/utils/handler.server'
import { updateSystemUserSchema } from '~/utils/schema/systemUserSchema'
import { validate } from '~/utils/validators/validate'
import { getUserById } from '~/services/User/Users.server'
import { getUserCreatedRole } from '~/services/Role/role.server'
import { DesktopDatePicker } from '@mui/x-date-pickers'
import { toast } from 'react-toastify'
import { getUserEntities } from '~/services/Entities/entity.server'
// import { getUserEntities } from '~/services/Entities/entity.server'

export const loader: LoaderFunction = async ({ request, params }) => {
    try {
        const user = await authenticator.isAuthenticated(request, {
            failureRedirect: '/login',
        })
        const userId = params?.userId as string
        const userData = (await getUserById(userId)) as any
        const { roles } = await getUserCreatedRole(user?.id)
        userData.userRoles = roles
        return json(
            Response({
                data: userData,
            })
        )
    } catch (err) {
        return errorHandler(err)
    }
}

export const action: ActionFunction = async ({ request, params }) => {
    try {
        const user = await authenticator.isAuthenticated(request, {
            failureRedirect: '/login',
        })
        const clients = (await getUserEntities(user?.id)) as any
        switch (request.method) {
            case 'PATCH': {
                const userId = params?.userId as any
                const formData = await request.formData()
                const updatedData = Object.fromEntries(formData) as any
                if (updatedData?.roleId) {
                    updatedData.roleId = JSON.parse(updatedData.roleId)
                }
                updatedData.userId = userId
                const { success, data, ...fieldError } = await validate(
                    updatedData,
                    updateSystemUserSchema
                )
                console.log({ updatedData, data, success, fieldError })
                if (!success) {
                    return json(
                        Response({
                            error: {
                                fieldError: [fieldError],
                                error: { message: 'Invalid user Input fields' },
                            },
                        }),
                        { status: 422 }
                    )
                }
                const updatedUser = await updateSystemUser(
                    user?.id,
                    userId,
                    data,
                    clients?.data?.id
                )
                return updatedUser
            }
            case 'DELETE': {
                const deletedUserId = params?.userId as string
                const deletedUserInfo = await deleteSystemUser(
                    user?.id,
                    deletedUserId
                )

                return deletedUserInfo
            }
            default:
                break
        }
    } catch (error) {
        console.log('INSIDE CATCH', { error })
        return await errorHandler(error)
    }
}

const SystemUsers = () => {
    const [searchParams] = useSearchParams()
    const status = searchParams.get('status')
    const actionData = useActionData()
    const loaderData = useLoaderData()
    const navigate = useNavigate()
    const transition = useNavigation()
    const submit = useSubmit()
    console.log({ loaderData })
    function onclose() {
        navigate(-1)
    }
    useEffect(() => {
        if (actionData != undefined) {
            if (actionData?.error) {
                toast.error(actionData?.error?.error?.message)
            }
            if (actionData?.data?.message) {
                // toast.success(actionData?.data?.message)
                navigate(-1)
            }
        }
    }, [actionData])

    const [values, setValues] = useState({}) as any
    const handleRoleChange = (
        event: SyntheticEvent<Element, Event>,
        value: any
    ) => {
        event.preventDefault()
        const roleIds = value.map((item: any) => item.id)
        values.roleId = JSON.stringify(roleIds)
    }

    const [birthDate, setBirthdate] = useState<Dayjs | null>(
        dayjs(loaderData?.data?.birthDate)
    )
    const handleBirthDateChange = (value: any) => {
        setBirthdate(value)
        values.birthDate = value
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault()
        setValues({ ...values, [event.target.name]: event.target.value })
    }

    function handleSubmit(event: any) {
        event.preventDefault()
        submit(values, { method: 'patch' })
    }
    if (!status) {
        return (
            <Modal open={true} closeAfterTransition>
                <Slide in={true} direction="left">
                    <Box
                        sx={{
                            position: 'relative',
                            float: 'right',
                        }}
                    >
                        <Card
                            sx={{
                                width: { xs: '100vw', sm: 600 },
                                height: '100vh',
                            }}
                        >
                            <Form onSubmit={handleSubmit}>
                                <Box
                                    sx={{
                                        height: { xs: 150, sm: 135 },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <Box sx={{ px: 5, pt: 5 }}>
                                            <Typography variant="h6">
                                                Edit User
                                            </Typography>
                                            <Typography>
                                                Edit user data by changing
                                                fields
                                            </Typography>
                                        </Box>

                                        <Box
                                            sx={{
                                                pr: 5,
                                                pt: 5,
                                            }}
                                        >
                                            <IconButton onClick={onclose}>
                                                <Close />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box
                                    sx={{
                                        overflowY: 'auto',
                                        '&::-webkit-scrollbar': {
                                            width: 0,
                                        },
                                        height: 'calc(100vh - 265px)',
                                        px: 5,
                                    }}
                                >
                                    <TextField
                                        label="First Name * "
                                        name="firstName"
                                        sx={{ py: 1 }}
                                        variant="filled"
                                        defaultValue={
                                            loaderData?.data?.firstName
                                        }
                                        onChange={handleChange}
                                        fullWidth
                                        helperText={
                                            actionData?.error?.fieldError &&
                                            actionData?.error?.fieldError[0]
                                                .fieldErrors?.firstName
                                                ? actionData?.error?.fieldError[0].fieldErrors?.firstName?.join(
                                                      ','
                                                  )
                                                : null
                                        }
                                        error={
                                            actionData?.error?.fieldError &&
                                            actionData?.error?.fieldError[0]
                                                .fieldErrors?.firstName
                                        }
                                    />
                                    <TextField
                                        label="Middle Name *"
                                        name="middleName"
                                        sx={{ py: 1 }}
                                        variant="filled"
                                        defaultValue={
                                            loaderData?.data?.middleName
                                        }
                                        onChange={handleChange}
                                        fullWidth
                                        helperText={
                                            actionData?.error?.fieldError &&
                                            actionData?.error?.fieldError[0]
                                                .fieldErrors?.middleName
                                                ? actionData?.error?.fieldError[0].fieldErrors?.middleName?.join(
                                                      ','
                                                  )
                                                : null
                                        }
                                        error={
                                            actionData?.error?.fieldError &&
                                            actionData?.error?.fieldError[0]
                                                .fieldErrors?.middleName
                                        }
                                    />
                                    <TextField
                                        name="lastName"
                                        label="Last Name *"
                                        sx={{ py: 1 }}
                                        variant="filled"
                                        defaultValue={
                                            loaderData?.data?.lastName
                                        }
                                        onChange={handleChange}
                                        fullWidth
                                        helperText={
                                            actionData?.error?.fieldError &&
                                            actionData?.error?.fieldError[0]
                                                .fieldErrors?.lastName
                                                ? actionData?.error?.fieldError[0].fieldErrors?.lastName?.join(
                                                      ','
                                                  )
                                                : null
                                        }
                                        error={
                                            actionData?.error?.fieldError &&
                                            actionData?.error?.fieldError[0]
                                                .fieldErrors?.lastName
                                        }
                                    />
                                    <TextField
                                        label="Email *"
                                        name="email"
                                        sx={{ py: 1 }}
                                        variant="filled"
                                        defaultValue={loaderData?.data?.email}
                                        onChange={handleChange}
                                        fullWidth
                                        helperText={
                                            actionData?.error?.fieldError &&
                                            actionData?.error?.fieldError[0]
                                                .fieldErrors?.email
                                                ? actionData?.error?.fieldError[0].fieldErrors?.email?.join(
                                                      ','
                                                  )
                                                : null
                                        }
                                        error={
                                            actionData?.error?.fieldError &&
                                            actionData?.error?.fieldError[0]
                                                .fieldErrors?.email
                                        }
                                    />

                                    <TextField
                                        name="phone"
                                        label="Phone Number *"
                                        sx={{ py: 1 }}
                                        variant="filled"
                                        defaultValue={loaderData?.data?.phone}
                                        onChange={handleChange}
                                        fullWidth
                                        helperText={
                                            actionData?.error?.fieldError &&
                                            actionData?.error?.fieldError[0]
                                                .fieldErrors?.phone
                                                ? actionData?.error?.fieldError[0].fieldErrors?.phone?.join(
                                                      ','
                                                  )
                                                : null
                                        }
                                        error={
                                            actionData?.error?.fieldError &&
                                            actionData?.error?.fieldError[0]
                                                .fieldErrors?.phone
                                        }
                                    />
                                    <DesktopDatePicker
                                        label="Birthdate"
                                        // inputFormat="MM/DD/YYYY"
                                        value={birthDate}
                                        onChange={handleBirthDateChange}
                                        //@ts-ignore
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                name="birthDate"
                                                fullWidth
                                                variant="filled"
                                                defaultValue={
                                                    loaderData?.data?.birthDate
                                                }
                                                helperText={
                                                    actionData?.error
                                                        ?.fieldError &&
                                                    actionData?.error
                                                        ?.fieldError[0]
                                                        .fieldErrors?.birthDate
                                                        ? actionData?.error?.fieldError[0].fieldErrors?.birthDate?.join(
                                                              ','
                                                          )
                                                        : null
                                                }
                                                error={
                                                    actionData?.error
                                                        ?.fieldError &&
                                                    actionData?.error
                                                        ?.fieldError[0]
                                                        .fieldErrors?.birthDate
                                                }
                                            />
                                        )}
                                    />

                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                    >
                                        <FormLabel id="demo-row-radio-buttons-group-label">
                                            Gender *
                                        </FormLabel>
                                        <RadioGroup
                                            row
                                            aria-labelledby="demo-row-radio-buttons-group-label"
                                            name="gender"
                                            defaultValue={
                                                loaderData?.data?.gender
                                            }
                                            onChange={handleChange}
                                        >
                                            <FormControlLabel
                                                value={GenderValue[1]}
                                                control={<Radio />}
                                                label="Female"
                                                sx={{
                                                    '&.Mui-checked': {
                                                        color: pink[600],
                                                    },
                                                }}
                                            />
                                            <FormControlLabel
                                                value={GenderValue[0]}
                                                control={<Radio />}
                                                label="Male"
                                                sx={{
                                                    '&.Mui-checked': {
                                                        color: blue[600],
                                                    },
                                                }}
                                            />
                                        </RadioGroup>
                                        <FormHelperText
                                            sx={{ color: 'red', mb: 2, pl: 2 }}
                                        >
                                            {actionData?.error?.fieldError &&
                                            actionData?.error?.fieldError[0]
                                                .fieldErrors?.gender
                                                ? actionData?.error?.fieldError[0].fieldErrors?.gender?.join(
                                                      ','
                                                  )
                                                : null}
                                        </FormHelperText>
                                    </Box>

                                    <Autocomplete
                                        multiple
                                        id="tags-filled"
                                        fullWidth
                                        onChange={(event, newValue) =>
                                            handleRoleChange(event, newValue)
                                        }
                                        defaultValue={loaderData?.data?.userRoles?.filter(
                                            (item: any) =>
                                                loaderData?.data?.roles?.some(
                                                    (e: any) => e.id === item.id
                                                )
                                        )}
                                        filterSelectedOptions
                                        options={
                                            loaderData?.data?.userRoles || []
                                        }
                                        getOptionLabel={(option: any) =>
                                            option?.name
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="outlined"
                                                label="Role"
                                                helperText={
                                                    actionData?.error
                                                        ?.fieldError &&
                                                    actionData?.error
                                                        ?.fieldError[0]
                                                        .fieldErrors?.roleId
                                                        ? actionData?.error?.fieldError[0].fieldErrors?.roleId?.join(
                                                              ','
                                                          )
                                                        : null
                                                }
                                                error={
                                                    actionData?.error
                                                        ?.fieldError &&
                                                    actionData?.error
                                                        ?.fieldError[0]
                                                        .fieldErrors?.roleId
                                                }
                                            />
                                        )}
                                    />
                                </Box>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        position: 'fixed',
                                        bottom: 0,
                                        width: { xs: '100vw', sm: 600 },
                                        height: 80,
                                        p: 3,
                                        bgcolor: '#F5F5F5',
                                    }}
                                >
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="success"
                                    >
                                        {transition.formAction ? (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    m: 1,
                                                }}
                                            >
                                                <CircularProgress
                                                    size={24}
                                                    color="secondary"
                                                    sx={{ mr: 2 }}
                                                />
                                                <Typography color="white">
                                                    Updating...
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography color="white">
                                                Update
                                            </Typography>
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
}

export default SystemUsers
