import { useActionData, useNavigate } from '@remix-run/react'
import { useEffect } from 'react'
import { LoaderFunction, ActionFunction, json } from '@remix-run/server-runtime'
import { authenticator } from '~/services/auth.server'
import { createSystemUser } from '~/services/User/systemuser.server'
import { Response, errorHandler } from '~/utils/handler.server'
import AddUserForm from '~/src/components/Forms/AddUserForm'
import { validate } from '~/utils/validators/validate'
import { systemUserSchema } from '~/utils/schema/systemUserSchema'
import { toast } from 'react-toastify'
import { getUserById } from '~/services/User/users.server'
import { getUserCreatedRole } from '~/services/Role/role.server'

export const loader: LoaderFunction = async ({ request, params }) => {
    try {
        const user = await authenticator.isAuthenticated(request, {
            failureRedirect: '/login',
        })
        const userData = (await getUserById(user?.id)) as any
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
    const navigate = useNavigate()

    useEffect(() => {
        if (actionData?.data?.message) {
            toast.success(actionData?.data?.message)
            navigate(-1)
        }
        if (actionData?.error) {
            toast.error(actionData?.error?.error?.message)
        }
    }, [actionData])

    return <AddUserForm openModal={true} closeModal={() => navigate(-1)} />
}
