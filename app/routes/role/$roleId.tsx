// import { roleSchema } from '~/utils/schema/roleSchema'
// import {
//     Box,
//     Button,
//     Typography,
//     Modal,
//     Slide,
//     Checkbox,
//     Card,
//     IconButton,
//     TextField,
//     FormControlLabel,
//     Autocomplete,
//     Grid,
//     Stack,
//     Chip,
//     CircularProgress,
//     AccordionSummary,
//     Accordion,
//     AccordionDetails,
//     Tooltip,
// } from '@mui/material'
// import { useNavigate, useSearchParams } from '@remix-run/react'
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
// import CloseIcon from '@mui/icons-material/Close'
// import type { ActionFunction, LoaderFunction } from '@remix-run/node'
// import { json, redirect } from '@remix-run/node'
// import { errorHandler } from '~/utils/AppErrors/ErrorHandler'
// import { commitSession, getSession, getUser } from '~/utils/session/session'
// import { useEffect, useRef, useState } from 'react'
// import {
//     Form,
//     useActionData,
//     useSubmit,
//     useLoaderData,
//     useTransition,
// } from '@remix-run/react'
// import type { EntityPermission } from '~/server/role/edit'
// import {
//     actionSelectedPermission,
//     allowedPermissions,
//     EditRole,
//     getEntityPermissions,
//     permissionAllocator,
//     removePermissions,
//     searchEntityPermissions,
// } from '~/server/role/edit'
// import { Response } from '~/utils/response'
// import { validate } from '~/utils/validators/validate'
// import { useSnackbar } from 'notistack'
// import {
//     categorizePermissions,
//     formatEntityPermissions,
// } from '~/server/role/edit'
// import { updateRoleStatus } from '~/dataAccess/role/role.server'
// import type { Permission } from '@prisma/client'
// import { getRoleById } from '~/dataAccess/role/getRole'
// import { logger } from '~/utils/logger'
// import { createActivityLog } from '~/server/ActivityLog/createActivityLog.server'

// export const loader: LoaderFunction = async ({ request, params }) => {
//     try {
//         const user = (await getUser(request)) as any
//         const { roleId } = params

//         if (!roleId) {
//             throw errorHandler(new Error('Invalid role'))
//         }
//         const role = await getRoleById(roleId)
//         if (role) {
//             const systemPermissions = (await allowedPermissions(
//                 user.id,
//                 '',
//                 'system',
//                 roleId,
//                 'update',
//                 'Role'
//             )) as any
//             console.log({ systemPermissions })
//             const entities = await getEntityPermissions(user.id, roleId)
//             return json(
//                 Response({
//                     data: {
//                         role: role.data,
//                         systemPermissions: systemPermissions?.rolePermissions,
//                         entities,
//                     },
//                 }),
//                 {
//                     status: 200,
//                 }
//             )
//         } else {
//             return json(
//                 Response({
//                     error: {
//                         error: {
//                             message: 'Role not found',
//                         },
//                     },
//                 }),
//                 {
//                     status: 400,
//                 }
//             )
//         }
//     } catch (err) {
//         return errorHandler(err)
//     }
// }

// export const action: ActionFunction = async ({ request, params }) => {
//     try {
//         const form = await request.formData()
//         const user = (await getUser(request)) as any
//         const { roleId } = params as any
//         const formData = Object.fromEntries(form) as any
//         let fetchedPermissions: any = []

//         if (request.method === 'POST') {
//             const data = Object.fromEntries(form) as any
//             let entity
//             if (data.entity) {
//                 entity = JSON.parse(data.entity)
//                 fetchedPermissions = await searchEntityPermissions(
//                     user.id,
//                     entity.values,
//                     entity.name,
//                     roleId
//                 )
//                 return json(
//                     Response({
//                         data: {
//                             permissions: formatEntityPermissions(
//                                 fetchedPermissions,
//                                 entity.name
//                             ),
//                             entityType: entity.name,
//                         },
//                     })
//                 )
//             }
//         }
//         if (request.method === 'PATCH') {
//             const session = (await getSession(
//                 request.headers.get('Cookie')
//             )) as any
//             let response: any
//             if (formData.status) {
//                 response = await updateRoleStatus(roleId, formData.status)
//                 session.message = 'Status successfully updated'
//                 if (response.status === 200) {
//                     session.set('message', session.message)
//                     return redirect('/role', {
//                         headers: {
//                             'Set-Cookie': await commitSession(session),
//                         },
//                     })
//                 } else {
//                     return json(
//                         Response({
//                             error: {
//                                 error: {
//                                     message: 'Status could not be updated',
//                                 },
//                             },
//                         })
//                     )
//                 }
//             } else {
//                 const { success, data, ...fieldError } = await validate(
//                     {
//                         name: formData.name,
//                         permissions: JSON.parse(formData.permissions),
//                     },
//                     roleSchema
//                 )
//                 if (!success) {
//                     return json(
//                         Response({
//                             error: {
//                                 fieldError: fieldError,
//                                 error: {
//                                     message: 'Invalid Inputs',
//                                 },
//                             },
//                         })
//                     )
//                 }
//                 response = await EditRole(
//                     user?.id,
//                     roleId,
//                     data.permissions,
//                     data.name
//                 )
//                 if (response.status === 200) {
//                     const logData = {
//                         userId: user.id,
//                         status: '200',
//                         event: 'update role',
//                         data: { response: response.data, request: data },
//                     }

//                     const loggerData = await logger(request, logData)

//                     await createActivityLog(loggerData)

//                     return json(
//                         Response({
//                             data: {
//                                 message: 'Role successfully updated.',
//                             },
//                         })
//                     )
//                 } else {
//                     return json(
//                         Response({
//                             error: {
//                                 error: {
//                                     message: 'Role could not be updated',
//                                 },
//                             },
//                         })
//                     )
//                 }
//             }
//         }
//         return null
//     } catch (err) {
//         console.log({ err })
//         return errorHandler(err)
//     }
// }

// export default function PagePage() {
//     const loaderData = useLoaderData()
//     const actionData = useActionData()
//     const transition = useTransition()
//     const [searchParams] = useSearchParams()
//     const view = searchParams.get('view')
//     const [currentRole, setCurrentRole] = useState<any>(
//         loaderData.data.role ? loaderData.data.role : null
//     )
//     const [selectedPermissions, setSelectedPermissions] = useState<
//         Permission[]
//     >([])
//     console.log({ loaderData, actionData })
//     const formREF = useRef<any>()
//     const [openModal, setOpenModal] = useState(true)
//     const { enqueueSnackbar } = useSnackbar()
//     const navigate = useNavigate()
//     const [bigState, setBigState] = useState<EntityPermission>({
//         associations: [],
//         registrantCompanies: [],
//         clients: [],
//         dapartments: [],
//     })
//     const submit = useSubmit()

//     let transitionData: any
//     transition?.submission?.formData
//         ? (transitionData = Object.fromEntries(
//               transition?.submission?.formData
//           ))
//         : (transitionData = '')

//     useEffect(() => {
//         if (actionData != undefined) {
//             if (actionData?.error) {
//                 enqueueSnackbar(actionData?.error?.error?.message, {
//                     variant: 'error',
//                     preventDuplicate: true,
//                 })
//             }
//             if (actionData?.data?.message) {
//                 enqueueSnackbar(actionData?.data?.message, {
//                     variant: 'success',
//                     preventDuplicate: true,
//                 })
//                 handleClose()
//             }
//             if (actionData?.data && actionData?.data?.permissions) {
//                 setBigState(
//                     permissionAllocator(actionData?.data?.permissions, bigState)
//                 )
//                 setSelectedPermissions(
//                     actionSelectedPermission(
//                         actionData.data.permissions,
//                         selectedPermissions
//                     )
//                 )
//             }
//         }
//     }, [actionData])

//     useEffect(() => {
//         if (loaderData != undefined) {
//             if (loaderData.data.role) {
//                 setCurrentRole(loaderData.data.role)
//             }
//             if (loaderData?.data?.entities) {
//                 setBigState(loaderData.data.entities)
//                 setSelectedPermissions(
//                     actionSelectedPermission(
//                         loaderData.data.entities,
//                         selectedPermissions
//                     )
//                 )
//             }
//             if (loaderData?.data?.systemPermissions) {
//                 let newPermission = selectedPermissions
//                 loaderData.data.systemPermissions.map((e: any) => {
//                     if (
//                         e.selected &&
//                         !selectedPermissions?.filter((item) => item.id === e.id)
//                             .length
//                     ) {
//                         newPermission?.push(e)
//                     }
//                 })
//                 setSelectedPermissions(newPermission)
//             }
//         }
//     }, [])

//     let selectedSystem = []
//     loaderData?.data?.systemPermissions?.length &&
//         loaderData?.data?.systemPermissions?.map((item: any) => {
//             if (item?.selected) {
//                 selectedSystem.push(item)
//             }
//         })

//     const handleClose = () => {
//         setOpenModal(false)
//         navigate('/role')
//     }
//     const handlePermissionChange = (elt: Permission) => {
//         let newPermissions: any[]
//         if (selectedPermissions?.filter((e) => e.id === elt.id).length) {
//             newPermissions = selectedPermissions?.filter((e) => e.id != elt.id)
//             setSelectedPermissions(newPermissions)
//         } else {
//             newPermissions = selectedPermissions
//             newPermissions.push(elt)
//             setSelectedPermissions(newPermissions)
//         }
//     }
//     const handleSubmit = (e: any) => {
//         e.preventDefault()
//         const formData = new FormData(formREF.current)
//         formData.set(
//             'permissions',
//             JSON.stringify(selectedPermissions?.map((e: any) => e.id))
//         )
//         submit(formData, {
//             method: 'patch',
//             action: `/role/${currentRole.id}`,
//         })
//     }
//     const handleValueChange = (e: any, value: any, name: any) => {
//         const { newPermission } = removePermissions(
//             bigState,
//             selectedPermissions,
//             value,
//             name
//         )
//         setSelectedPermissions(newPermission)
//         return submit(
//             {
//                 entity: JSON.stringify({ values: value, name: name }),
//                 roleId: currentRole.id,
//                 type: name,
//             },
//             { method: 'post' }
//         )
//     }
//     function PermissionList({ permissions, handlePermissionChange }: any) {
//         let catagorizedPermissions: any
//         if (permissions && permissions.length) {
//             catagorizedPermissions = categorizePermissions(permissions)
//         }

//         let temp = selectedPermissions.map((item: Permission) => {
//             return item.id
//         })
//         let temp2 = permissions.map((item: Permission) => {
//             return item.id
//         })
//         return (
//             <Box>
//                 {!view && (
//                     <FormControlLabel
//                         control={
//                             <Tooltip
//                                 arrow
//                                 placement="bottom"
//                                 title="Select All"
//                             >
//                                 <Checkbox
//                                     checked={permissions.every((e: any) => {
//                                         return temp.includes(e.id)
//                                     })}
//                                     onChange={() => {
//                                         if (
//                                             permissions.every((e: any) => {
//                                                 return temp.includes(e.id)
//                                             })
//                                         ) {
//                                             setSelectedPermissions((state) => [
//                                                 ...state.filter(
//                                                     (el: any) =>
//                                                         !temp2.includes(el.id)
//                                                 ),
//                                             ])
//                                         } else {
//                                             const unselected =
//                                                 permissions.filter(
//                                                     (e: any) =>
//                                                         temp.indexOf(e.id) < 0
//                                                 )
//                                             setSelectedPermissions(
//                                                 (state: any) => [
//                                                     ...state,
//                                                     ...unselected,
//                                                 ]
//                                             )
//                                         }
//                                     }}
//                                 />
//                             </Tooltip>
//                         }
//                         label="Select all"
//                     />
//                 )}
//                 <Box sx={{ display: 'block' }}>
//                     {Object.keys(catagorizedPermissions).length ? (
//                         Object.keys(catagorizedPermissions)?.map((cat) => {
//                             return (
//                                 <Box key={cat}>
//                                     {view &&
//                                     !catagorizedPermissions[cat].some(
//                                         (item: any) => item['selected'] === true
//                                     ) ? (
//                                         ''
//                                     ) : (
//                                         <Typography>{cat}</Typography>
//                                     )}

//                                     {catagorizedPermissions[cat].map(
//                                         (elt: any) => {
//                                             if (view && !elt.selected) {
//                                                 return
//                                             }
//                                             return (
//                                                 <Tooltip
//                                                     arrow
//                                                     placement="bottom"
//                                                     title={elt?.description}
//                                                 >
//                                                     <Chip
//                                                         key={elt}
//                                                         icon={
//                                                             <FormControlLabel
//                                                                 name="permissions"
//                                                                 value={
//                                                                     selectedPermissions
//                                                                 }
//                                                                 control={
//                                                                     <Checkbox
//                                                                         defaultChecked={
//                                                                             selectedPermissions?.filter(
//                                                                                 (
//                                                                                     e: Permission
//                                                                                 ) =>
//                                                                                     e.id ===
//                                                                                     elt.id
//                                                                             )
//                                                                                 .length
//                                                                                 ? true
//                                                                                 : false
//                                                                         }
//                                                                         value={JSON.stringify(
//                                                                             selectedPermissions
//                                                                         )}
//                                                                         name={
//                                                                             'permission'
//                                                                         }
//                                                                         onChange={() => {
//                                                                             let newPermissions: any[]
//                                                                             if (
//                                                                                 selectedPermissions?.filter(
//                                                                                     (
//                                                                                         e
//                                                                                     ) =>
//                                                                                         e.id ===
//                                                                                         elt.id
//                                                                                 )
//                                                                                     .length
//                                                                             ) {
//                                                                                 newPermissions =
//                                                                                     selectedPermissions?.filter(
//                                                                                         (
//                                                                                             e
//                                                                                         ) =>
//                                                                                             e.id !=
//                                                                                             elt.id
//                                                                                     )
//                                                                                 setSelectedPermissions(
//                                                                                     newPermissions
//                                                                                 )
//                                                                             } else {
//                                                                                 setSelectedPermissions(
//                                                                                     (
//                                                                                         state
//                                                                                     ) => [
//                                                                                         ...state,
//                                                                                         elt,
//                                                                                     ]
//                                                                                 )
//                                                                             }
//                                                                         }}
//                                                                         disabled={
//                                                                             view
//                                                                                 ? true
//                                                                                 : false
//                                                                         }
//                                                                     />
//                                                                 }
//                                                                 label={elt.name}
//                                                             />
//                                                         }
//                                                         sx={{
//                                                             m: 1,
//                                                         }}
//                                                     />
//                                                 </Tooltip>
//                                             )
//                                         }
//                                     )}
//                                 </Box>
//                             )
//                         })
//                     ) : (
//                         <Typography> No Permissions</Typography>
//                     )}
//                 </Box>
//             </Box>
//         )
//     }

//     return (
//         <Box>
//             <Modal open={openModal} onClose={handleClose} closeAfterTransition>
//                 <Slide in={openModal} direction="left">
//                     <Box
//                         sx={{
//                             position: 'relative',
//                             float: 'right',
//                             border: 'Highlight',
//                         }}
//                     >
//                         <Card
//                             sx={{
//                                 width: { xs: '100vw', md: 1000 },
//                                 height: '100vh',
//                             }}
//                         >
//                             {' '}
//                             <Box
//                                 sx={{
//                                     display: 'flex',
//                                     justifyContent: 'space-between',
//                                 }}
//                             >
//                                 <Box sx={{ px: 5, pt: 5 }}>
//                                     <Typography variant="h6">
//                                         {view
//                                             ? 'View Role Permissions'
//                                             : 'Update Role'}
//                                     </Typography>
//                                 </Box>

//                                 <Box
//                                     sx={{
//                                         pr: 5,
//                                         pt: 5,
//                                     }}
//                                 >
//                                     <IconButton onClick={handleClose}>
//                                         <CloseIcon />
//                                     </IconButton>
//                                 </Box>
//                             </Box>
//                             <Form
//                                 method="patch"
//                                 onSubmit={(e) => handleSubmit(e)}
//                                 ref={formREF}
//                             >
//                                 <Box
//                                     sx={{
//                                         height: {
//                                             xs: 150,
//                                             sm: 135,
//                                         },
//                                     }}
//                                 >
//                                     <Box
//                                         sx={{
//                                             overflowY: 'auto',
//                                             '&::-webkit-scrollbar': {
//                                                 width: 0,
//                                             },
//                                             height: 'calc(100vh - 265px)',
//                                             px: 5,
//                                         }}
//                                     >
//                                         <Grid container>
//                                             <Grid xs={12} sm={4} sx={{ mt: 2 }}>
//                                                 <Stack>
//                                                     <Autocomplete
//                                                         multiple
//                                                         fullWidth
//                                                         onChange={(
//                                                             event,
//                                                             value
//                                                         ) =>
//                                                             handleValueChange(
//                                                                 event,
//                                                                 value,
//                                                                 'department'
//                                                             )
//                                                         }
//                                                         options={
//                                                             loaderData.data
//                                                                 .entities
//                                                                 ?.dapartments ||
//                                                             []
//                                                         }
//                                                         getOptionLabel={(
//                                                             option: any
//                                                         ) => {
//                                                             console.log(
//                                                                 'option',
//                                                                 option
//                                                             )
//                                                             return option
//                                                                 ?.department
//                                                                 ?.name
//                                                         }}
//                                                         defaultValue={loaderData?.data?.entities?.dapartments.filter(
//                                                             (e: any) => {
//                                                                 if (
//                                                                     e?.hasSelected ===
//                                                                         true &&
//                                                                     e
//                                                                         .permissions
//                                                                         ?.length
//                                                                 )
//                                                                     return e
//                                                             }
//                                                         )}
//                                                         filterSelectedOptions
//                                                         disabled={
//                                                             view ? true : false
//                                                         }
//                                                         sx={{ p: 2 }}
//                                                         renderInput={(
//                                                             params
//                                                         ) => (
//                                                             <TextField
//                                                                 {...params}
//                                                                 label="Department"
//                                                             />
//                                                         )}
//                                                     />
//                                                     <Autocomplete
//                                                         multiple
//                                                         sx={{ p: 2 }}
//                                                         filterSelectedOptions
//                                                         fullWidth
//                                                         onChange={(
//                                                             event,
//                                                             newValue
//                                                         ) =>
//                                                             handleValueChange(
//                                                                 event,
//                                                                 newValue,
//                                                                 'client'
//                                                             )
//                                                         }
//                                                         id="controllable-states-demo"
//                                                         options={
//                                                             (loaderData &&
//                                                                 loaderData.data
//                                                                     ?.entities
//                                                                     .clients) ||
//                                                             []
//                                                         }
//                                                         defaultValue={loaderData.data?.entities?.clients?.filter(
//                                                             (e: any) =>
//                                                                 e?.hasSelected &&
//                                                                 e.permissions
//                                                                     ?.length
//                                                         )}
//                                                         getOptionLabel={(
//                                                             option: any
//                                                         ) =>
//                                                             option?.client
//                                                                 ?.name || ''
//                                                         }
//                                                         disabled={
//                                                             view ? true : false
//                                                         }
//                                                         renderInput={(
//                                                             params
//                                                         ) => (
//                                                             <TextField
//                                                                 {...params}
//                                                                 label="Clients"
//                                                             />
//                                                         )}
//                                                     />
//                                                     <Autocomplete
//                                                         // value={value}
//                                                         multiple
//                                                         filterSelectedOptions
//                                                         onChange={(
//                                                             event,
//                                                             newValue
//                                                         ) =>
//                                                             handleValueChange(
//                                                                 event,
//                                                                 newValue,
//                                                                 'association'
//                                                             )
//                                                         }
//                                                         id="controllable-states-demo"
//                                                         options={
//                                                             (loaderData &&
//                                                                 loaderData?.data
//                                                                     ?.entities
//                                                                     ?.associations) ||
//                                                             []
//                                                         }
//                                                         defaultValue={loaderData?.data?.entities?.associations?.filter(
//                                                             (e: any) =>
//                                                                 e?.hasSelected &&
//                                                                 e.permissions
//                                                                     ?.length
//                                                         )}
//                                                         getOptionLabel={(
//                                                             option: any
//                                                         ) =>
//                                                             option?.association
//                                                                 ?.name
//                                                         }
//                                                         disabled={
//                                                             view ? true : false
//                                                         }
//                                                         sx={{ p: 2 }}
//                                                         fullWidth
//                                                         renderInput={(
//                                                             params
//                                                         ) => (
//                                                             <TextField
//                                                                 {...params}
//                                                                 label="Associations"
//                                                             />
//                                                         )}
//                                                     />

//                                                     <Autocomplete
//                                                         // value={value}
//                                                         multiple
//                                                         filterSelectedOptions
//                                                         onChange={(
//                                                             event,
//                                                             newValue
//                                                         ) =>
//                                                             handleValueChange(
//                                                                 event,
//                                                                 newValue,
//                                                                 'registrant_company'
//                                                             )
//                                                         }
//                                                         id="controllable-states-demo"
//                                                         options={
//                                                             (loaderData &&
//                                                                 loaderData.data
//                                                                     .entities
//                                                                     .registrantCompanies) ||
//                                                             []
//                                                         }
//                                                         getOptionLabel={(
//                                                             option: any
//                                                         ) =>
//                                                             option
//                                                                 ?.registrantCompany
//                                                                 ?.name || ''
//                                                         }
//                                                         defaultValue={loaderData?.data?.entities.registrantCompanies?.filter(
//                                                             (e: any) =>
//                                                                 e?.hasSelected &&
//                                                                 e.permissions
//                                                                     ?.length
//                                                         )}
//                                                         disabled={
//                                                             view ? true : false
//                                                         }
//                                                         sx={{ p: 2 }}
//                                                         fullWidth
//                                                         renderInput={(
//                                                             params
//                                                         ) => (
//                                                             <TextField
//                                                                 {...params}
//                                                                 label="Registrants"
//                                                             />
//                                                         )}
//                                                     />
//                                                 </Stack>
//                                             </Grid>
//                                             <Grid xs={12} sm={8}>
//                                                 <TextField
//                                                     autoFocus
//                                                     margin="dense"
//                                                     name="name"
//                                                     sx={{ py: 2 }}
//                                                     defaultValue={
//                                                         currentRole
//                                                             ? currentRole.name
//                                                             : ''
//                                                     }
//                                                     label="Role Name"
//                                                     variant="outlined"
//                                                     helperText={
//                                                         actionData?.error &&
//                                                         actionData?.fieldError
//                                                             ?.fieldErrors?.name
//                                                             ? actionData?.error
//                                                                   ?.fieldError
//                                                                   ?.fieldErrors
//                                                                   ?.name[0]
//                                                             : undefined
//                                                     }
//                                                     disabled={
//                                                         view ? true : false
//                                                     }
//                                                     error={
//                                                         actionData?.error &&
//                                                         actionData?.error?.error
//                                                             ?.fieldError &&
//                                                         actionData?.error
//                                                             ?.fieldError
//                                                             .fieldErrors.name
//                                                     }
//                                                     fullWidth
//                                                 />
//                                                 {view &&
//                                                 !selectedSystem.length ? (
//                                                     ''
//                                                 ) : (
//                                                     <Accordion>
//                                                         <AccordionSummary
//                                                             expandIcon={
//                                                                 <ExpandMoreIcon />
//                                                             }
//                                                             aria-controls="panel1a-content"
//                                                             id="panel1a-header"
//                                                         >
//                                                             <Typography>
//                                                                 System
//                                                                 Permissions
//                                                             </Typography>
//                                                         </AccordionSummary>
//                                                         <AccordionDetails>
//                                                             <PermissionList
//                                                                 handlePermissionChange={
//                                                                     handlePermissionChange
//                                                                 }
//                                                                 permissions={
//                                                                     loaderData
//                                                                         ?.data
//                                                                         ?.systemPermissions
//                                                                 }
//                                                             />
//                                                         </AccordionDetails>
//                                                     </Accordion>
//                                                 )}

//                                                 <Box sx={{ my: 1 }}>
//                                                     {bigState &&
//                                                     bigState.dapartments.length
//                                                         ? bigState.dapartments.map(
//                                                               (department) => {
//                                                                   if (
//                                                                       department
//                                                                           ?.permissions
//                                                                           ?.length
//                                                                   ) {
//                                                                       return (
//                                                                           <Accordion
//                                                                               key={
//                                                                                   department
//                                                                                       .department
//                                                                                       .id
//                                                                               }
//                                                                           >
//                                                                               <AccordionSummary
//                                                                                   expandIcon={
//                                                                                       <ExpandMoreIcon />
//                                                                                   }
//                                                                                   aria-controls="panel1a-content"
//                                                                                   id="panel1a-header"
//                                                                               >
//                                                                                   <Typography>
//                                                                                       {' '}
//                                                                                       {department
//                                                                                           ?.department
//                                                                                           .name +
//                                                                                           ' Permissions'}
//                                                                                   </Typography>
//                                                                               </AccordionSummary>
//                                                                               <AccordionDetails>
//                                                                                   <PermissionList
//                                                                                       handlePermissionChange={
//                                                                                           handlePermissionChange
//                                                                                       }
//                                                                                       permissions={
//                                                                                           department.permissions
//                                                                                       }
//                                                                                   />
//                                                                               </AccordionDetails>
//                                                                           </Accordion>
//                                                                       )
//                                                                   }
//                                                               }
//                                                           )
//                                                         : undefined}

//                                                     {transition.state ===
//                                                         'submitting' &&
//                                                     transitionData.type &&
//                                                     transitionData.type ===
//                                                         'department' ? (
//                                                         <Box
//                                                             sx={{
//                                                                 display: 'flex',
//                                                                 justifyContent:
//                                                                     'center',
//                                                                 m: 3,
//                                                             }}
//                                                         >
//                                                             <CircularProgress
//                                                                 size={24}
//                                                             />
//                                                         </Box>
//                                                     ) : (
//                                                         <></>
//                                                     )}
//                                                 </Box>

//                                                 <Box sx={{ my: 1 }}>
//                                                     {bigState &&
//                                                     bigState?.clients?.length
//                                                         ? bigState?.clients.map(
//                                                               (client) => {
//                                                                   if (
//                                                                       client
//                                                                           ?.permissions
//                                                                           ?.length
//                                                                   ) {
//                                                                       return (
//                                                                           <Accordion
//                                                                               key={
//                                                                                   client
//                                                                                       .client
//                                                                                       .id
//                                                                               }
//                                                                           >
//                                                                               <AccordionSummary
//                                                                                   expandIcon={
//                                                                                       <ExpandMoreIcon />
//                                                                                   }
//                                                                                   aria-controls="panel1a-content"
//                                                                                   id="panel1a-header"
//                                                                               >
//                                                                                   <Typography>
//                                                                                       {' '}
//                                                                                       {client
//                                                                                           ?.client
//                                                                                           .name +
//                                                                                           ' Permissions'}
//                                                                                   </Typography>
//                                                                               </AccordionSummary>
//                                                                               <AccordionDetails>
//                                                                                   <PermissionList
//                                                                                       handlePermissionChange={
//                                                                                           handlePermissionChange
//                                                                                       }
//                                                                                       permissions={
//                                                                                           client.permissions
//                                                                                       }
//                                                                                   />
//                                                                               </AccordionDetails>
//                                                                           </Accordion>
//                                                                       )
//                                                                   }
//                                                               }
//                                                           )
//                                                         : undefined}

//                                                     {transition.state ===
//                                                         'submitting' &&
//                                                     transitionData.type &&
//                                                     transitionData.type ===
//                                                         'client' ? (
//                                                         <Box
//                                                             sx={{
//                                                                 display: 'flex',
//                                                                 justifyContent:
//                                                                     'center',
//                                                                 m: 3,
//                                                             }}
//                                                         >
//                                                             <CircularProgress
//                                                                 size={24}
//                                                             />
//                                                         </Box>
//                                                     ) : (
//                                                         <></>
//                                                     )}
//                                                 </Box>

//                                                 <Box sx={{ my: 1 }}>
//                                                     {bigState &&
//                                                     bigState?.associations
//                                                         ?.length
//                                                         ? bigState?.associations.map(
//                                                               (association) => {
//                                                                   if (
//                                                                       association
//                                                                           ?.permissions
//                                                                           ?.length
//                                                                   ) {
//                                                                       return (
//                                                                           <Accordion
//                                                                               key={
//                                                                                   association
//                                                                                       .association
//                                                                                       .id
//                                                                               }
//                                                                           >
//                                                                               <AccordionSummary
//                                                                                   expandIcon={
//                                                                                       <ExpandMoreIcon />
//                                                                                   }
//                                                                                   aria-controls="panel1a-content"
//                                                                                   id="panel1a-header"
//                                                                               >
//                                                                                   <Typography>
//                                                                                       {' '}
//                                                                                       {association
//                                                                                           ?.association
//                                                                                           .name +
//                                                                                           ' Permissions'}
//                                                                                   </Typography>
//                                                                               </AccordionSummary>
//                                                                               <AccordionDetails>
//                                                                                   <PermissionList
//                                                                                       handlePermissionChange={
//                                                                                           handlePermissionChange
//                                                                                       }
//                                                                                       permissions={
//                                                                                           association.permissions
//                                                                                       }
//                                                                                   />
//                                                                               </AccordionDetails>
//                                                                           </Accordion>
//                                                                       )
//                                                                   }
//                                                               }
//                                                           )
//                                                         : undefined}

//                                                     {transition.state ===
//                                                         'submitting' &&
//                                                     transitionData.type &&
//                                                     transitionData.type ===
//                                                         'association' ? (
//                                                         <Box
//                                                             sx={{
//                                                                 display: 'flex',
//                                                                 justifyContent:
//                                                                     'center',
//                                                                 m: 3,
//                                                             }}
//                                                         >
//                                                             <CircularProgress
//                                                                 size={24}
//                                                             />
//                                                         </Box>
//                                                     ) : (
//                                                         <></>
//                                                     )}
//                                                 </Box>

//                                                 <Box sx={{ my: 1 }}>
//                                                     {bigState &&
//                                                     bigState
//                                                         ?.registrantCompanies
//                                                         ?.length
//                                                         ? bigState?.registrantCompanies.map(
//                                                               (
//                                                                   registrantCompany
//                                                               ) => {
//                                                                   if (
//                                                                       registrantCompany
//                                                                           ?.permissions
//                                                                           ?.length
//                                                                   ) {
//                                                                       return (
//                                                                           <Accordion
//                                                                               key={
//                                                                                   registrantCompany
//                                                                                       .registrantCompany
//                                                                                       .id
//                                                                               }
//                                                                           >
//                                                                               <AccordionSummary
//                                                                                   expandIcon={
//                                                                                       <ExpandMoreIcon />
//                                                                                   }
//                                                                                   aria-controls="panel1a-content"
//                                                                                   id="panel1a-header"
//                                                                               >
//                                                                                   <Typography>
//                                                                                       {' '}
//                                                                                       {registrantCompany
//                                                                                           ?.registrantCompany
//                                                                                           .name +
//                                                                                           ' Permissions'}
//                                                                                   </Typography>
//                                                                               </AccordionSummary>
//                                                                               <AccordionDetails>
//                                                                                   <PermissionList
//                                                                                       handlePermissionChange={
//                                                                                           handlePermissionChange
//                                                                                       }
//                                                                                       permissions={
//                                                                                           registrantCompany.permissions
//                                                                                       }
//                                                                                   />
//                                                                               </AccordionDetails>
//                                                                           </Accordion>
//                                                                       )
//                                                                   }
//                                                               }
//                                                           )
//                                                         : undefined}

//                                                     {transition.state ===
//                                                         'submitting' &&
//                                                     transitionData.type &&
//                                                     transitionData.type ===
//                                                         'registrnatCompany' ? (
//                                                         <Box
//                                                             sx={{
//                                                                 display: 'flex',
//                                                                 justifyContent:
//                                                                     'center',
//                                                                 m: 3,
//                                                             }}
//                                                         >
//                                                             <CircularProgress
//                                                                 size={24}
//                                                             />
//                                                         </Box>
//                                                     ) : (
//                                                         <></>
//                                                     )}
//                                                 </Box>
//                                             </Grid>
//                                         </Grid>
//                                     </Box>
//                                     <Box
//                                         sx={{
//                                             display: 'flex',
//                                             justifyContent: 'flex-end',
//                                             position: 'fixed',
//                                             bottom: 0,
//                                             width: {
//                                                 xs: '100vw',
//                                                 md: 1000,
//                                             },
//                                             height: 80,
//                                             py: 2,
//                                             pr: 10,
//                                             bgcolor: '#F5F5F5',
//                                         }}
//                                     >
//                                         {view ? (
//                                             <></>
//                                         ) : (
//                                             <Button
//                                                 type="submit"
//                                                 size="large"
//                                                 variant="contained"
//                                                 sx={{ px: 5 }}
//                                             >
//                                                 {transition.state ===
//                                                     'submitting' &&
//                                                 transitionData.name ? (
//                                                     <Box
//                                                         sx={{
//                                                             display: 'flex',
//                                                             justifyContent:
//                                                                 'center',
//                                                             m: 1,
//                                                         }}
//                                                     >
//                                                         <CircularProgress
//                                                             size={24}
//                                                             color="secondary"
//                                                             sx={{ mr: 2 }}
//                                                         />
//                                                         <Typography color="white">
//                                                             Saving...
//                                                         </Typography>
//                                                     </Box>
//                                                 ) : (
//                                                     <Typography color="white">
//                                                         Save role
//                                                     </Typography>
//                                                 )}
//                                             </Button>
//                                         )}
//                                     </Box>
//                                 </Box>
//                             </Form>
//                         </Card>
//                     </Box>
//                 </Slide>
//             </Modal>
//         </Box>
//     )
// }
import React from 'react'

const RoleId = () => {
  return (
    <div>$roleId</div>
  )
}

export default RoleId