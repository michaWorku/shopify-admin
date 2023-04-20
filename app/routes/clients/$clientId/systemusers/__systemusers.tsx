import {
    Link,
    Outlet,
    useActionData,
    useFetcher,
    useLoaderData,
    useLocation,
    useNavigate,
    useNavigation,
} from '@remix-run/react'
import type { MRT_ColumnDef } from 'material-react-table'
import { useEffect, useMemo, useState } from 'react'
import type { User} from '@prisma/client';
import { Gender, Status } from '@prisma/client'
import {
    CustomizedTable,
    RowActions,
    StatusUpdate,
} from '~/src/components/Table'
import moment from 'moment'
import DateFilter from '~/src/components/Table/DatePicker'
import { Box, Button, Card, Modal, Slide } from '@mui/material'
import FilterModes from '~/src/components/Table/CustomFilter'
import type {
    LoaderFunction} from '@remix-run/server-runtime';
import {
    ActionFunction,
    json,
    redirect,
} from '@remix-run/server-runtime'
import { authenticator } from '~/services/auth.server'
import {
    createSystemUser,
    getSystemUsers,
} from '~/services/User/systemuser.server'
import { Response, errorHandler } from '~/utils/handler.server'
import AddUserForm from '~/src/components/Forms/AddUserForm'
import { getUserCreatedRole } from '~/services/Role/role.server'
import canUser, { AbilityType } from '~/utils/casl/ability'
import { validate } from '~/utils/validators/validate'
import { systemUserSchema } from '~/utils/schema/systemUserSchema'
import { toast } from 'react-toastify'
import { DeleteAlert } from '~/src/components'
import type { DeleteDialogType } from '~/src/components/DeleteAlert'

export const loader: LoaderFunction = async ({ request, params }) => {
    try {
        // Authenticate the user
        const user = await authenticator.isAuthenticated(request, {
            failureRedirect: '/login',
        })
        let canCreate: any
        const systemUsers = await getSystemUsers(
            request,
            user?.id,
            params?.clientId
        )
        const { roles } = await getUserCreatedRole(user?.id)
        if (params?.clientId) {
            canCreate = await canUser(
                user?.id,
                'create',
                'SystemUser',
                { clientId: params?.clientId },
                AbilityType.PARTIAL
            )
        } else {
            canCreate = await canUser(
                user?.id,
                'create',
                'SystemUser',
                {},
                AbilityType.PARTIAL
            )
        }
        return Response({
            data: {
                data: systemUsers?.data,
                canCreate: canCreate?.ok,
                roles: roles,
                user
            },
            metaData: systemUsers?.metaData,
        })
    } catch (error) {
        return errorHandler(error)
    }
}

export const handle = {
    BreadCrumb: () => (
        <Link
            style={{ textDecoration: 'none', color: 'white' }}
            to="/systemusers"
        >
            System Users
        </Link>
    ),
}
export const DefaultDialogInfo = {
    open: false,
    id: '',
    title: 'Remove a System User',
    contentText: 'Are you sure you want to remove this User?',
    action: 'systemusers',
}
const SystemUsers = () => {
    const loaderData = useLoaderData()
    const actionData = useActionData()
    const navigate = useNavigate()
    const location = useLocation()

    const fetcher = useFetcher()
    const navigation = useNavigation()
    const [deleteDialog, setDeleteDialog] =
        useState<DeleteDialogType>(DefaultDialogInfo)
    const [loading, setLoading] = useState(false)
    const [openModal, setOpenModal] = useState(false)

    console.log({ loaderData, actionData })

    function handleEdit(row: any) {
        navigate(`${row}`)
    }
    useEffect(() => {
        if (fetcher?.data?.error?.error?.message) {
            toast.error(fetcher?.data?.error?.error?.message)
        }
        if (fetcher?.data?.message) {
            toast.success(fetcher?.data?.message)
            setOpenModal(false)
            setDeleteDialog(DefaultDialogInfo)
        }
    }, [fetcher?.data])

    const columns = useMemo<MRT_ColumnDef<User>[]>(
        () => [
            {
                accessorFn: (originalRow) =>
                    (originalRow.firstName || ' ') +
                    ' ' +
                    (originalRow.middleName || ' ') +
                    ' ' +
                    (originalRow.lastName || ' '),
                id: 'name',
                header: 'Name',
                renderColumnFilterModeMenuItems: FilterModes,
            },
            {
                accessorKey: 'email',
                header: 'Email',
                renderColumnFilterModeMenuItems: FilterModes,
            },
            {
                accessorKey: 'phone',
                header: 'Phone Number',
                renderColumnFilterModeMenuItems: FilterModes,
            },
            {
                accessorKey: 'gender',
                header: 'Gender',
                filterVariant: 'select',
                filterSelectOptions: Object.keys(Gender).map((gender) => {
                    return {
                        text: gender,
                        value: gender,
                    }
                }),
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
                        route={`${location.pathname}/${row.original.id}?status=true`}
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
                        page="system users"
                        handleEdit={() => handleEdit(row?.original?.id)}
                        deleteCol={true}
                        handleDelete={handleDelete}
                    />
                ),
            },
        ],
        []
    )
    const handleOpenModal = () => {
        navigate('addNew')
    }
    const handleDelete = (userId: any) => {
        setDeleteDialog({
            open: true,
            id: userId,
            title: 'Remove a System User',
            contentText: 'Are you sure you want to remove this System User?',
            action: `systemusers/${userId}`,
        })
    }

    return (
        <Box>
            <CustomizedTable
                columns={columns}
                data={loaderData}
                exportFileName="SystemUsers"
                enableExport={true}
                loading={
                    loading || navigation.state === 'loading' ? true : false
                }
                customAction={(table: any) => (
                    <Button variant="add" onClick={handleOpenModal}>
                        Add User
                    </Button>
                )}
            />
            <DeleteAlert
                deleteDialog={deleteDialog}
                setDeleteDialog={setDeleteDialog}
                fetcher={fetcher}
            />
            <Outlet />
        </Box>
    )
}

export default SystemUsers
