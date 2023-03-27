/* eslint-disable react/jsx-pascal-case */

import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { Outlet } from "@remix-run/react";
// import { getUser, getSession, commitSession } from '~/utils/session/session'
// import { getRoles } from '~/server/role/roles'
import type { MRT_ColumnDef } from "material-react-table";
// import { getEntities } from '~/server/permissions/getEntities'
// import AddRoleForm from '~/components/AddRoleForm'
// import { getSystemPermissions } from '~/server/permissions/getSystemPermissions'
import { Box, Button, Card, Modal, Slide } from "@mui/material";
// import { validate } from '~/utils/validators/validate'
// import { roleSchema } from '~/utils/schema/roleSchema'
// import { createRole } from '~/server/role/createRole.server'
// import { getEntityPermissions } from '~/server/permissions/getEntityPermissions'
import { useState, useEffect } from "react";
import { Status } from "@prisma/client";
import type { Role } from "@prisma/client";
import { toast } from "react-toastify";
import { useMemo } from "react";
import { Response, errorHandler } from "~/utils/handler.server";
import moment from "moment";
import { CustomizedTable } from "~/src/components/Table";
import AddRoleForm from "~/src/components/AddRoleForm";
import { authenticator } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/session.server";
// import DateFilter from '~/components/DateFilter'
// import StatusUpdate from '~/components/StatusUpdate'
// import CustomizedTable from '~/components/CustomizedTable'
// import FilterModes from '~/components/customFilter'
// import RowActions from '~/components/RowActions'
// import canUser, { AbilityType } from '~/utils/casl/ability'

export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const user = await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    });
    const session = await getSession(request.headers.get("Cookie"));
    const message = session.get("message") || null;
    session.unset("message");

    let roles = await getRoles(request, user.id);
    const systemPermission = await getSystemPermissions(user.id);
    const clients = await getEntities(user.id, "client");

    const able = await canUser(user.id, "create", "Role", {}, AbilityType.BOTH);

    const canCreate = able?.ok;

    let systemPermissions;
    if (systemPermission?.data) {
      systemPermissions = systemPermission?.data;
    }
    const responseData = {
      data: {
        data: roles?.data,
        canCreate,
        user,
        systemPermissions,
        message: message,
        entities: {
          clients,
        },
      },
      metaData: roles?.metaData,
    };
    return json(responseData, {
      status: 200,
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    errorHandler(error);
  }
};
// export const action: ActionFunction = async ({ request }) => {
//     try {
//         //  check the user logged in
//         const user = (await getUser(request)) as any

//         const formData = await request.formData()
//         const fields = Object.fromEntries(formData) as any
//         if (fields.type) {
//             const permissions = await getEntityPermissions(
//                 user.id,
//                 fields.entityKey,
//                 JSON.parse(fields?.entities) as any
//             )
//             return json(
//                 Response({
//                     data: {
//                         permissions: {
//                             [fields.type]: permissions,
//                         },
//                     },
//                 })
//             )
//         }
//         const permissions: any = fields?.permissions
//         fields.permissions = JSON.parse(permissions)
//         const { success, data, ...fieldError } = await validate(
//             fields,
//             roleSchema
//         )
//         if (!success) {
//             return json(
//                 Response({
//                     error: {
//                         fieldError: [fieldError],
//                         error: { message: 'Validation error' },
//                     },
//                 }),
//                 { status: 422 }
//             )
//         } else {
//             const role = await createRole(user.id, fields)
//             return role
//         }
//     } catch (error) {
//         return errorHandler(error)
//     }
// }

export const handle = {
  BreadCrumb: () => (
    <Link style={{ textDecoration: "none", color: "white" }} to="/role">
      Role
    </Link>
  ),
};

export default function ViewRole() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const transition = useTransition();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transition.state === "idle" && loading) {
      setLoading(false);
    }
  }, [transition.state]);

  const [openModal, setOpenModal] = useState(true);

  useEffect(() => {
    if (transition.state === "idle" && loadingEdit) {
      setLoadingEdit(false);
    }
  }, [transition.state]);

  const [loadingEdit, setLoadingEdit] = useState<boolean>(false);
  const columns = useMemo<MRT_ColumnDef<Role>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        // renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorFn: (originalRow) =>
          moment(originalRow.createdAt).format("lll"),
        id: "createdAt",
        header: "Created At",
        filterVariant: "date" as any,
        size: 220,
        // Filter: (props) => <DateFilter {...props} />,
        // renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "status",
        header: "Status",
        // filterSelectOptions: Object.keys(ModelStatus).map((status) => {
        //     return {
        //         text: status,
        //         value: status,
        //     }
        // }),
        // renderColumnFilterModeMenuItems: FilterModes,
        filterVariant: "multi-select",
        // Cell: ({ row, table }) => (
        //     <StatusUpdate
        //         row={row}
        //         route={`/role/${row.original.id}?status=true`}
        //     />
        // ),
      },
      {
        accessorKey: "actions" as any,
        header: "Actions",
        enableSorting: false,
        flex: 1,
        enableColumnFilter: false,
        // Cell: ({ row, table }) => (
        //     <RowActions row={row} page="role" deleteCol={false} />
        // ),
      },
    ],
    []
  );

  // useEffect(() => {
  //     if (loaderData?.data?.message) {
  //         enqueueSnackbar(loaderData?.data?.message, {
  //             variant: 'success',
  //             preventDuplicate: true,
  //         })
  //     }
  // }, [loaderData, enqueueSnackbar])

  // useEffect(() => {
  //     if (actionData !== undefined) {
  //         if (actionData?.error?.error) {
  //             enqueueSnackbar(
  //                 actionData?.error?.error?.message || 'Network Error',
  //                 {
  //                     variant: 'error',
  //                     preventDuplicate: true,
  //                 }
  //             )
  //         }
  //         if (!actionData?.error && actionData?.data?.name) {
  //             handleCloseModal()
  //             enqueueSnackbar('Role created successfully', {
  //                 variant: 'success',
  //                 preventDuplicate: true,
  //             })
  //         }
  //     }
  // }, [actionData, enqueueSnackbar])

  const handleOpenModal = () => {
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  console.log({ loaderData });
  return (
    <Box m={2}>
      <CustomizedTable
        columns={columns}
        data={loaderData}
        page="Role"
        // openModal={handleOpenModal}
        loading={loading || transition.state === "loading" ? true : false}
        enableExport={true}
        customAction={(table: any) => (
          <Button
            variant="contained"
            onClick={handleOpenModal}
            sx={{ color: "#FFF", px: 5, py: 1 }}
          >
            Add Role
          </Button>
        )}
      />
      <Box>
        <Modal open={openModal} onClose={handleCloseModal} closeAfterTransition>
          <Slide in={openModal} direction="left">
            <Box sx={{ position: "relative", float: "right" }}>
              <Card
                sx={{
                  width: { xs: "100vw", md: 800 },
                  height: "100vh",
                }}
              >
                <AddRoleForm handleCloseModal={handleCloseModal} />
              </Card>
            </Box>
          </Slide>
        </Modal>
      </Box>
      <Outlet />
    </Box>
  );
}
