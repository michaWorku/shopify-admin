import { roleSchema } from '~/utils/schema/roleSchema'
import {
    Box,
    Button,
    Typography,
    Modal,
    Slide,
    Checkbox,
    Card,
    IconButton,
    TextField,
    FormControlLabel,
    Autocomplete,
    Grid,
    Stack,
    Chip,
    CircularProgress,
    AccordionSummary,
    Accordion,
    AccordionDetails,
    Tooltip,
} from '@mui/material'
import { Response, errorHandler } from '~/utils/handler.server'
import {
    useCatch,
    useNavigate,
    useNavigation,
    useSearchParams,
} from '@remix-run/react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CloseIcon from '@mui/icons-material/Close'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useEffect, useRef, useState } from 'react'
import {
    Form,
    useActionData,
    useSubmit,
    useLoaderData,
    useTransition,
} from '@remix-run/react'

import { validate } from '~/utils/validators/validate'

import type { Permission } from '@prisma/client'
import canUser from '~/utils/casl/ability'
import { authenticator } from '~/services/auth.server'
import {
    deleteRole,
    editRole,
    getRoleById,
    getRoleClientPermissions,
    getRolePermissions,
    getRoleSystemPermissions,
} from '~/services/Role/role.server'
import { toast } from 'react-toastify'
import { getEntities } from '~/services/Entities/entity.server'
import { getUserEntities } from '~/services/Entities/entity.server'

export const loader: LoaderFunction = async ({ request, params }) => {
    try {
        const user = await authenticator.isAuthenticated(request, {
            failureRedirect: '/login',
        })
        const { roleId } = params

        if (!roleId) {
            throw errorHandler(new Error('Invalid role'))
        }
        const role = await getRoleById(roleId)

        if (role) {
            const clients = await getEntities(user.id)
            // Check if user is system user
            const systemUserAbility = await canUser(
                user?.id,
                'update',
                'Role',
                {}
            )
            if (systemUserAbility.status === 200) {
                // Get role Permissions

                const systemPermissions = await getRoleSystemPermissions(
                    user?.id,
                    roleId
                )
                const clientPermissions = await getRoleClientPermissions(
                    user?.id,
                    roleId
                )

                return json(
                    Response({
                        data: {
                            role: role,
                            systemPermissions:
                                systemPermissions?.rolePermissions,
                            clientPermissions:
                                clientPermissions?.rolePermissions,
                        },
                    }),
                    {
                        status: 200,
                    }
                )
            } else if (!clients?.status && clients?.entities) {
                const clientUserAbility = await canUser(
                    user?.id,
                    'update',
                    'Role',
                    { clientId: clients?.entities?.data?.id }
                )
                if (clientUserAbility.status === 200) {
                    const permissions = await getRolePermissions(
                        user?.id,
                        roleId
                    )
                    return json(
                        Response({
                            data: {
                                role: permissions?.role,
                                clientPermissions: permissions?.rolePermissions,
                            },
                        }),
                        {
                            status: 200,
                        }
                    )
                    // get role Permissions
                } else {
                    return clientUserAbility
                }
            } else {
                return systemUserAbility
            }
        } else {
            return json(
                Response({
                    error: {
                        error: {
                            message: 'Role not found',
                        },
                    },
                }),
                {
                    status: 400,
                }
            )
        }
    } catch (err) {
        return errorHandler(err)
    }
}

export const action: ActionFunction = async ({ request, params }) => {
    try {
        const user = await authenticator.isAuthenticated(request, {
            failureRedirect: '/login',
        })
        const form = await request.formData()
        const { roleId } = params as any
        const formData = Object.fromEntries(form) as any
        const clients = (await getUserEntities(user?.id)) as any

        if (request.method === 'PATCH') {
            const { success, data, ...fieldError } = await validate(
                {
                    name: formData?.name,
                    permissions: formData?.name
                        ? JSON.parse(formData.permissions)
                        : undefined,
                    status: formData.status,
                },
                roleSchema
            )
            if (!success) {
                return json(
                    Response({
                        error: {
                            fieldError: fieldError,
                            error: {
                                message: 'Invalid Inputs',
                            },
                        },
                    })
                )
            }

            const response = await editRole(user?.id, roleId, {
                permissions: data?.permissions,
                name: data?.name,
                status: data?.status,
            })
            if (response.status === 200) {
                return json(
                    Response({
                        data: {
                            message: data?.status
                                ? 'Status successfully updated'
                                : 'Role successfully updated.',
                        },
                    })
                )
            } else {
                return json(
                    Response({
                        error: {
                            error: {
                                message: 'Role could not be updated',
                            },
                        },
                    })
                )
            }
        }
        if (request.method === 'DELETE') {
            const deletedRole = await deleteRole(
                roleId,
                user?.id,
                clients?.data?.id
            )
            return deletedRole
        }
    } catch (err) {
        return errorHandler(err)
    }
}

export default function PagePage() {
    const [searchParams] = useSearchParams()
    const status = searchParams.get('status')
    const loaderData = useLoaderData()
    const actionData = useActionData()
    const transition = useNavigation()
    const view = searchParams.get('view')

    const [currentRole, setCurrentRole] = useState<any>(
        loaderData?.data?.role ? loaderData?.data?.role : null
    )
    const [selectedPermissions, setSelectedPermissions] = useState<
        Permission[]
    >([])
    const formREF = useRef<any>()
    const [openModal, setOpenModal] = useState(true)
    const navigate = useNavigate()
    const [clientPermissions, setClientPermissions] = useState('')
    const [systemPermissions, setSystemPermissions] = useState('')

    const submit = useSubmit()

    let transitionData: any
    transition?.formData
        ? (transitionData = Object.fromEntries(transition?.formData))
        : (transitionData = '')

    useEffect(() => {
        if (actionData != undefined) {
            if (actionData?.error) {
                toast.error(actionData?.error?.error?.message)
            }
            if (actionData?.data?.message) {
                toast.success(actionData?.data?.message)
                handleClose()
            }
        }
    }, [actionData])

    useEffect(() => {
        if (loaderData != undefined) {
            if (loaderData?.data?.role) {
                setCurrentRole(loaderData?.data?.role)
            }
            if (loaderData?.data?.clientPermissions) {
                setClientPermissions(loaderData?.data?.clientPermissions)
                setSelectedPermissions(
                    loaderData?.data?.clientPermissions?.filter(
                        (e: any) => e.selected
                    )
                )
            }
            if (loaderData?.data?.systemPermissions) {
                setSystemPermissions(loaderData?.data?.systemPermissions)
                let newPermission = selectedPermissions
                loaderData.data.systemPermissions.map((e: any) => {
                    if (
                        e.selected &&
                        !selectedPermissions?.filter((item) => item.id === e.id)
                            .length
                    ) {
                        newPermission?.push(e)
                    }
                })
                setSelectedPermissions(newPermission)
            }
        }
    }, [])

    let selectedSystem = []
    loaderData?.data?.systemPermissions?.length &&
        loaderData?.data?.systemPermissions?.map((item: any) => {
            if (item?.selected) {
                selectedSystem.push(item)
            }
        })

    const handleClose = () => {
        setOpenModal(false)
        navigate('/role')
    }
    const handlePermissionChange = (elt: Permission) => {
        let newPermissions: any[]
        if (selectedPermissions?.filter((e) => e.id === elt.id).length) {
            newPermissions = selectedPermissions?.filter((e) => e.id != elt.id)
            setSelectedPermissions(newPermissions)
        } else {
            newPermissions = selectedPermissions
            newPermissions.push(elt)
            setSelectedPermissions(newPermissions)
        }
    }
    const handleSubmit = (e: any) => {
        e.preventDefault()
        const formData = new FormData(formREF.current)
        formData.set(
            'permissions',
            JSON.stringify(selectedPermissions?.map((e: any) => e.id))
        )
        submit(formData, {
            method: 'patch',
            action: `/role/${currentRole.id}`,
        })
    }
    const categorizePermissions = (rawPermissions: []) => {
        console.log({ rawPermissions })
        const permissions = rawPermissions?.reduce(function (
            permissions: any,
            permission: any
        ) {
            if (permission?.category in permissions) {
                permissions[permission?.category]?.push(permission)
            } else {
                permissions[permission?.category] = [permission]
            }
            return permissions
        },
        {})
        return permissions
    }
    function PermissionList({ permissions }: any) {
        let catagorizedPermissions: any
        if (permissions && permissions.length) {
            catagorizedPermissions = categorizePermissions(permissions)
        }

        let temp = selectedPermissions.map((item: Permission) => {
            return item.id
        })
        let temp2 = permissions?.map((item: Permission) => {
            return item.id
        })
        return (
            <Box>
                {!view && (
                    <FormControlLabel
                        control={
                            <Tooltip
                                arrow
                                placement="bottom"
                                title="Select All"
                            >
                                <Checkbox
                                    checked={permissions?.every((e: any) => {
                                        return temp.includes(e.id)
                                    })}
                                    onChange={() => {
                                        if (
                                            permissions?.every((e: any) => {
                                                return temp.includes(e.id)
                                            })
                                        ) {
                                            setSelectedPermissions((state) => [
                                                ...state.filter(
                                                    (el: any) =>
                                                        !temp2.includes(el.id)
                                                ),
                                            ])
                                        } else {
                                            const unselected =
                                                permissions.filter(
                                                    (e: any) =>
                                                        temp.indexOf(e.id) < 0
                                                )
                                            setSelectedPermissions(
                                                (state: any) => [
                                                    ...state,
                                                    ...unselected,
                                                ]
                                            )
                                        }
                                    }}
                                />
                            </Tooltip>
                        }
                        label="Select all"
                    />
                )}
                <Box sx={{ display: 'block' }}>
                    {catagorizedPermissions &&
                    Object.keys(catagorizedPermissions).length ? (
                        Object.keys(catagorizedPermissions)?.map((cat) => {
                            return (
                                <Box key={cat}>
                                    {view &&
                                    !catagorizedPermissions[cat].some(
                                        (item: any) => item['selected'] === true
                                    ) ? (
                                        ''
                                    ) : (
                                        <Typography>{cat}</Typography>
                                    )}

                                    {catagorizedPermissions[cat].map(
                                        (elt: any) => {
                                            if (view && !elt.selected) {
                                                return
                                            }
                                            return (
                                                <Tooltip
                                                    arrow
                                                    placement="bottom"
                                                    title={elt?.description}
                                                >
                                                    <Chip
                                                        key={elt}
                                                        icon={
                                                            <FormControlLabel
                                                                name="permissions"
                                                                value={
                                                                    selectedPermissions
                                                                }
                                                                control={
                                                                    <Checkbox
                                                                        defaultChecked={
                                                                            selectedPermissions?.filter(
                                                                                (
                                                                                    e: Permission
                                                                                ) =>
                                                                                    e.id ===
                                                                                    elt.id
                                                                            )
                                                                                .length
                                                                                ? true
                                                                                : false
                                                                        }
                                                                        value={JSON.stringify(
                                                                            selectedPermissions
                                                                        )}
                                                                        name={
                                                                            'permission'
                                                                        }
                                                                        onChange={() => {
                                                                            let newPermissions: any[]
                                                                            if (
                                                                                selectedPermissions?.filter(
                                                                                    (
                                                                                        e
                                                                                    ) =>
                                                                                        e.id ===
                                                                                        elt.id
                                                                                )
                                                                                    .length
                                                                            ) {
                                                                                newPermissions =
                                                                                    selectedPermissions?.filter(
                                                                                        (
                                                                                            e
                                                                                        ) =>
                                                                                            e.id !=
                                                                                            elt.id
                                                                                    )
                                                                                setSelectedPermissions(
                                                                                    newPermissions
                                                                                )
                                                                            } else {
                                                                                setSelectedPermissions(
                                                                                    (
                                                                                        state
                                                                                    ) => [
                                                                                        ...state,
                                                                                        elt,
                                                                                    ]
                                                                                )
                                                                            }
                                                                        }}
                                                                        disabled={
                                                                            view
                                                                                ? true
                                                                                : false
                                                                        }
                                                                    />
                                                                }
                                                                label={elt.name}
                                                            />
                                                        }
                                                        sx={{
                                                            m: 1,
                                                        }}
                                                    />
                                                </Tooltip>
                                            )
                                        }
                                    )}
                                </Box>
                            )
                        })
                    ) : (
                        <Typography> No Permissions</Typography>
                    )}
                </Box>
            </Box>
        )
    }

    if (!status) {
        return (
            <Box>
                <Modal
                    open={openModal}
                    onClose={handleClose}
                    closeAfterTransition
                >
                    <Slide in={openModal} direction="left">
                        <Box
                            sx={{
                                position: 'relative',
                                float: 'right',
                                border: 'Highlight',
                            }}
                        >
                            <Card
                                sx={{
                                    width: { xs: '100vw', md: 1000 },
                                    height: '100vh',
                                }}
                            >
                                {' '}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Box sx={{ px: 5, pt: 5 }}>
                                        <Typography variant="h6">
                                            {view
                                                ? 'View Role Permissions'
                                                : 'Update Role'}
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            pr: 5,
                                            pt: 5,
                                        }}
                                    >
                                        <IconButton onClick={handleClose}>
                                            <CloseIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Form
                                    method="patch"
                                    onSubmit={(e) => handleSubmit(e)}
                                    ref={formREF}
                                >
                                    <Box
                                        sx={{
                                            height: {
                                                xs: 150,
                                                sm: 135,
                                            },
                                        }}
                                    >
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
                                            <Grid container>
                                                <Grid xs={12} sm={8}>
                                                    <TextField
                                                        autoFocus
                                                        margin="dense"
                                                        name="name"
                                                        sx={{ py: 2 }}
                                                        defaultValue={
                                                            currentRole
                                                                ? currentRole.name
                                                                : ''
                                                        }
                                                        label="Role Name"
                                                        variant="outlined"
                                                        helperText={
                                                            actionData?.error &&
                                                            actionData
                                                                ?.fieldError
                                                                ?.fieldErrors
                                                                ?.name
                                                                ? actionData
                                                                      ?.error
                                                                      ?.fieldError
                                                                      ?.fieldErrors
                                                                      ?.name[0]
                                                                : undefined
                                                        }
                                                        disabled={
                                                            view ? true : false
                                                        }
                                                        error={
                                                            actionData?.error &&
                                                            actionData?.error
                                                                ?.error
                                                                ?.fieldError &&
                                                            actionData?.error
                                                                ?.fieldError
                                                                .fieldErrors
                                                                .name
                                                        }
                                                        fullWidth
                                                    />

                                                    <Box sx={{ my: 1 }}>
                                                        {systemPermissions &&
                                                        systemPermissions?.length ? (
                                                            <Accordion>
                                                                <AccordionSummary
                                                                    expandIcon={
                                                                        <ExpandMoreIcon />
                                                                    }
                                                                    aria-controls="panel1a-content"
                                                                    id="panel1a-header"
                                                                >
                                                                    <Typography>
                                                                        System
                                                                        Permissions
                                                                    </Typography>
                                                                </AccordionSummary>
                                                                <AccordionDetails>
                                                                    <PermissionList
                                                                        handlePermissionChange={
                                                                            handlePermissionChange
                                                                        }
                                                                        permissions={
                                                                            systemPermissions
                                                                        }
                                                                    />
                                                                </AccordionDetails>
                                                            </Accordion>
                                                        ) : undefined}
                                                    </Box>
                                                    <Box sx={{ my: 1 }}>
                                                        {clientPermissions &&
                                                        clientPermissions?.length ? (
                                                            <Accordion>
                                                                <AccordionSummary
                                                                    expandIcon={
                                                                        <ExpandMoreIcon />
                                                                    }
                                                                    aria-controls="panel1a-content"
                                                                    id="panel1a-header"
                                                                >
                                                                    <Typography>
                                                                        Client
                                                                        Permissions
                                                                    </Typography>
                                                                </AccordionSummary>
                                                                <AccordionDetails>
                                                                    <PermissionList
                                                                        handlePermissionChange={
                                                                            handlePermissionChange
                                                                        }
                                                                        permissions={
                                                                            clientPermissions
                                                                        }
                                                                    />
                                                                </AccordionDetails>
                                                            </Accordion>
                                                        ) : undefined}
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                position: 'fixed',
                                                bottom: 0,
                                                width: {
                                                    xs: '100vw',
                                                    md: 1000,
                                                },
                                                height: 80,
                                                py: 2,
                                                pr: 10,
                                                bgcolor: '#F5F5F5',
                                            }}
                                        >
                                            {view ? (
                                                <></>
                                            ) : (
                                                <Button
                                                    type="submit"
                                                    size="large"
                                                    variant="contained"
                                                    sx={{ px: 5 }}
                                                >
                                                    {transition.state ===
                                                        'submitting' &&
                                                    transitionData.name ? (
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent:
                                                                    'center',
                                                                m: 1,
                                                            }}
                                                        >
                                                            <CircularProgress
                                                                size={24}
                                                                color="secondary"
                                                                sx={{ mr: 2 }}
                                                            />
                                                            <Typography color="white">
                                                                Saving...
                                                            </Typography>
                                                        </Box>
                                                    ) : (
                                                        <Typography color="white">
                                                            Save role
                                                        </Typography>
                                                    )}
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </Form>
                            </Card>
                        </Box>
                    </Slide>
                </Modal>
            </Box>
        )
    }
    return <></>
}
