import {
    Outlet,
    useActionData,
    useFetcher,
    useLoaderData,
    useLocation,
    useNavigate,
    useNavigation,
} from '@remix-run/react'
import { MRT_ColumnDef } from 'material-react-table'
import { useEffect, useMemo, useState } from 'react'
import { User, Gender, Status } from '@prisma/client'
import {
    CustomizedTable,
    RowActions,
    StatusUpdate,
} from '~/src/components/Table'
import moment from 'moment'
import DateFilter from '~/src/components/Table/DatePicker'
import { Box, Button, Card, Modal, Slide } from '@mui/material'
import FilterModes from '~/src/components/Table/CustomFilter'
import { LoaderFunction, ActionFunction, json } from '@remix-run/server-runtime'
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
import { DeleteDialogType } from '~/src/components/DeleteAlert'

export const action: ActionFunction = async ({ request, params }) => {
    // Authenticate the user
    try {
        const user = await authenticator.isAuthenticated(request, {
            failureRedirect: '/login',
        })
        const form = await request.formData()
        const userData = Object.fromEntries(form) as any
        if (userData?.roleId) {
            userData.roleId = JSON.parse(userData.roleId)
        }
        const { success, data, ...fieldError } = await validate(
            userData,
            systemUserSchema
        )
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
        } else {
            const response = await createSystemUser(
                user?.id,
                data,
                params?.clientId
            )
            if (response.status == 200) {
            }
            return response
        }
    } catch (err) {
        return await errorHandler(err)
    }
}
export default function Users() {
    const actionData = useActionData<typeof action>()
    const [loading, setLoading] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (actionData?.data?.message) {
            toast.success(actionData?.data?.message)
            setOpenModal(false)
        }
        if (actionData?.error) {
            toast.error(actionData?.error?.error?.message)
            setLoading(false)
        }
    }, [actionData])

    return <AddUserForm openModal={true} closeModal={() => navigate(-1)} />
}
