/* eslint-disable react/jsx-pascal-case */

import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import {
    Link,
    useActionData,
    useLoaderData,
    useNavigate,
    useNavigation,
} from '@remix-run/react'
import { Outlet } from '@remix-run/react'
import type { MRT_ColumnDef } from 'material-react-table'
import { Box, Button, Card, Modal, Slide } from '@mui/material'
import { useState, useEffect } from 'react'
import { Status } from '@prisma/client'
import type { Role } from '@prisma/client'
import { toast } from 'react-toastify'
import { useMemo } from 'react'
import { Response, errorHandler } from '~/utils/handler.server'
import moment from 'moment'
import { CustomizedTable } from '~/src/components/Table'
import AddRoleForm from '~/src/components/Forms/AddRoleForm'
import { authenticator } from '~/services/auth.server'
import { commitSession, getSession } from '~/services/session.server'
import { createRole, getAllRoles } from '~/services/Role/role.server'
import { getSystemPermissions } from '~/services/Role/Permissions/permission.server'

import canUser, { AbilityType } from '~/utils/casl/ability'
import { validate } from '~/utils/validators/validate'
import { roleSchema } from '~/utils/schema/roleSchema'
import FilterModes from '~/src/components/Table/CustomFilter'
import DateFilter from '~/src/components/Table/DatePicker'
import StatusUpdate from '~/src/components/Table/StatusUpdate'
import RowActions from '~/src/components/Table/RowActions'
import { getEntities } from '~/services/Entities/entity.server'

/**
 * Loader function to fetch role and permisions.
 * @param request The incoming HTTP request.
 * @param params The URL params for the current route.
 * @returns The response data for role route.
 */
export const loader: LoaderFunction = async ({ request, params }) => {
    try {
        // Authenticate the user
        const user = await authenticator.isAuthenticated(request, {
            failureRedirect: '/login',
        })

        // // Get the user's session
        const session = await getSession(request.headers.get('Cookie'))

        // // Get the message from the session, if any
        const message = session.get('message') || null
        session.unset('message')

        // Get all roles for the user
        const roles = (await getAllRoles(request, user.id)) as any
        // Get system permissions for the user
        const systemPermission = await getSystemPermissions(user.id)

        // Get all clients for the user
        const clients = await getEntities(user.id)

        // Check if the user can create a new role
        const able = (await canUser(
            user.id,
            'create',
            'Role',
            {},
            AbilityType.BOTH
        )) as any

        let systemPermissions
        if (systemPermission?.data) {
            systemPermissions = systemPermission?.data
        }

        // Build the response data
        const responseData = {
            data: {
                data: roles?.data,
                canCreate: able?.ok,
                user,
                systemPermissions,
                message,
                entities: {
                    clients,
                },
            },
            metaData: roles?.metaData,
        }
        // Return the response with the session cookie set
        return json(responseData, {
            status: 200,
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        })
    } catch (error) {
        // Handle errors
        return errorHandler(error)
    }
}

export const action: ActionFunction = async ({ request }) => {
    try {
        const user = await authenticator.isAuthenticated(request, {
            failureRedirect: '/login',
        })

        const formData = await request.formData()
        const fields = Object.fromEntries(formData) as any
        const permissions: any = fields?.permissions
        fields.permissions = JSON.parse(permissions)
        const { success } = await validate(fields, roleSchema)
        if (success) {
            const role = await createRole(user.id, fields)
            return role
        }
    } catch (error: any) {
        if (!error?.success) {
            return json(
                Response({
                    error: {
                        fieldError: [
                            error?.field,
                            error?.fieldErrors,
                            error?.formated,
                        ],
                        error: { message: 'Validation error' },
                    },
                }),
                { status: 422 }
            )
        }
        return errorHandler(error)
    }
}

export const handle = {
    BreadCrumb: () => (
        <Link style={{ textDecoration: 'none', color: 'white' }} to="/role">
            Role
        </Link>
    ),
}

export default function ViewRole() {
    const loaderData = useLoaderData()
    const actionData = useActionData()
    const navigate = useNavigate()
    const navigation = useNavigation()
    const [loading, setLoading] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [loadingEdit, setLoadingEdit] = useState<boolean>(false)

    useEffect(() => {
        if (navigation.state === 'idle' && loading) {
            setLoading(false)
        }
        if (navigation.state === 'idle' && loadingEdit) {
            setLoadingEdit(false)
        }
    }, [navigation.state])
    function handleEdit(row: any) {
        navigate(`${row}`)
    }
    const columns = useMemo<MRT_ColumnDef<Role>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Name',
                renderColumnFilterModeMenuItems: FilterModes,
            },
            {
                accessorFn: (originalRow) =>
                    moment(originalRow.createdAt).format('lll'),
                id: 'createdAt',
                header: 'Created At',
                filterVariant: 'date' as any,
                size: 220,
                Filter: (props) => <DateFilter {...props} />,
                renderColumnFilterModeMenuItems: FilterModes,
            },
            {
                accessorKey: 'status',
                header: 'Status',
                filterSelectOptions: Object.keys(Status).map((status) => {
                    return {
                        text: status,
                        value: status,
                    }
                }),
                renderColumnFilterModeMenuItems: FilterModes,
                filterVariant: 'multi-select',
                Cell: ({ row, table }) => (
                    <StatusUpdate
                        row={row}
                        route={`/role/${row.original.id}?status=true`}
                    />
                ),
            },
            {
                accessorKey: 'actions' as any,
                header: 'Actions',
                enableSorting: false,
                flex: 1,
                enableColumnFilter: false,
                Cell: ({ row, table }) => (
                    <RowActions
                        row={row}
                        page="role"
                        handleEdit={() => handleEdit(row?.original?.id)}
                        deleteCol={false}
                    />
                ),
            },
        ],
        []
    )

    useEffect(() => {
        if (actionData !== undefined) {
            if (actionData?.error?.error) {
                toast.error(actionData?.error?.error?.message)
            }
            if (!actionData?.error && actionData?.data?.role) {
                handleCloseModal()
                toast.success(actionData?.data?.message)
            }
        }
    }, [actionData])

    const handleOpenModal = () => {
        setOpenModal(true)
    }
    const handleCloseModal = () => {
        setOpenModal(false)
    }
    return (
        <Box m={2}>
            <CustomizedTable
                columns={columns}
                data={loaderData}
                page="Role"
                // openModal={handleOpenModal}
                loading={
                    loading || navigation.state === 'loading' ? true : false
                }
                enableExport={true}
                customAction={(table: any) => (
                    <Button
                        variant="add"
                        onClick={handleOpenModal}
                        // sx={{ color: "#FFF", px: 2, py: 0.5 }}
                    >
                        Add Role
                    </Button>
                )}
            />
            <Box>
                <Modal
                    open={openModal}
                    onClose={handleCloseModal}
                    closeAfterTransition
                >
                    <Slide in={openModal} direction="left">
                        <Box sx={{ position: 'relative', float: 'right' }}>
                            <Card
                                sx={{
                                    width: { xs: '100vw', md: 800 },
                                    height: '100vh',
                                }}
                            >
                                <AddRoleForm
                                    handleCloseModal={handleCloseModal}
                                    loaderData={loaderData}
                                    actionData={actionData}
                                />
                            </Card>
                        </Box>
                    </Slide>
                </Modal>
            </Box>
            <Outlet />
        </Box>
    )
}
