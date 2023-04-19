import {
  Outlet,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import type { MRT_ColumnDef } from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@prisma/client";
import { Gender, Status } from "@prisma/client";
import {
  CustomizedTable,
  RowActions,
  StatusUpdate,
} from "~/src/components/Table";
import Link from "@mui/material/Link";
import moment from "moment";
import DateFilter from "~/src/components/Table/DatePicker";
import { Box, Button, Typography } from "@mui/material";
import FilterModes from "~/src/components/Table/CustomFilter";
import type { LoaderFunction, ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { authenticator } from "~/services/auth.server";
import { getSession } from "~/services/session.server";
import {
  createSystemUser,
  getSystemUsers,
} from "~/services/User/systemuser.server";
import { Response, errorHandler } from "~/utils/handler.server";
import AddUserForm from "~/src/components/Forms/AddUserForm";
import { getUserCreatedRole } from "~/services/Role/role.server";
import canUser, { AbilityType } from "~/utils/casl/ability";
import { validate } from "~/utils/validators/validate";
import { systemUserSchema } from "~/utils/schema/systemUserSchema";
import { toast } from "react-toastify";
// import { getUserEntities } from '~/services/Entities/Entity.server'
import { DeleteAlert } from "~/src/components";
import type { DeleteDialogType } from "~/src/components/DeleteAlert";
import { getUserEntities } from "~/services/Entities/entity.server";
import palette from "~/src/theme/palette";
import { formHandler } from "~/utils/formHandler";
import Navbar from "~/src/components/Layout/Navbar";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    // Authenticate the user
    const user = await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    });
    let canCreate: any;
    const clients = (await getUserEntities(user?.id)) as any;
    const systemUsers = await getSystemUsers(
      request,
      user?.id,
      clients?.data?.id
    );
    const { roles } = await getUserCreatedRole(user?.id);
    if (clients?.data?.id) {
      canCreate = await canUser(
        user?.id,
        "create",
        "SystemUser",
        { clientId: clients?.data?.id },
        AbilityType.PARTIAL
      );
    } else {
      canCreate = await canUser(
        user?.id,
        "create",
        "SystemUser",
        {},
        AbilityType.PARTIAL
      );
    }

    return Response({
      data: {
        data: systemUsers?.data,
        canCreate: canCreate?.ok,
        roles: roles,
        user: user,
      },
      metaData: systemUsers?.metaData,
    });
  } catch (error) {
    return errorHandler(error);
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  // Authenticate the user
  try {
    const user = await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    });
    const clients = (await getUserEntities(user?.id)) as any;
    const result = (await formHandler(request, systemUserSchema)) as any;
    if (!result?.success) {
      return result;
    } else {
      if (result?.roleId) {
        result.roleId = JSON.parse(result.roleId);
      }
      const response = await createSystemUser(
        user?.id,
        result?.data,
        clients?.data?.id
      );
      return response;
    }
  } catch (err) {
    console.log("INSIDE CATCH", { err });
    return await errorHandler(err);
  }
};

export const DefaultDialogInfo = {
  open: false,
  id: "",
  title: "Remove a System User",
  contentText: "Are you sure you want to remove this User?",
  action: "systemusers",
};
const SystemUsers = () => {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const navigation = useNavigation();
  const [deleteDialog, setDeleteDialog] =
    useState<DeleteDialogType>(DefaultDialogInfo);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  function handleEdit(row: any) {
    navigate(`${row}`);
  }
  const breadcrumbs = [
    <Typography
      key={"1"}
      variant="h6"
      color={palette.primary.main}
      fontSize={"bold"}
    >
      System User
    </Typography>,
  ];
  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        accessorFn: (originalRow) =>
          (originalRow.firstName || " ") +
          " " +
          (originalRow.middleName || " ") +
          " " +
          (originalRow.lastName || " "),
        id: "name",
        header: "Name",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "email",
        header: "Email",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "phone",
        header: "Phone Number",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "gender",
        header: "Gender",
        filterVariant: "select",
        filterSelectOptions: Object.keys(Gender).map((gender) => {
          return {
            text: gender,
            value: gender,
          };
        }),
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorFn: (originalRow) =>
          moment(originalRow.createdAt).format("lll"),
        id: "createdAt",
        header: "Created At",
        filterVariant: "date" as any,
        size: 220,
        Filter: (props) => <DateFilter {...props} />,
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 220,
        filterSelectOptions: Object.keys(Status).map((status) => {
          return {
            text: status,
            value: status,
          };
        }),
        renderColumnFilterModeMenuItems: FilterModes,
        filterVariant: "multi-select",
        Cell: ({ row, table }) => (
          <StatusUpdate
            row={row}
            route={`/systemusers/${row.original.id}?status=true`}
          />
        ),
      },
      {
        accessorKey: "actions" as any,
        header: "Actions",
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
  );
  const handleOpenModal = () => {
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  const handleDelete = (clientId: any) => {
    setDeleteDialog({
      open: true,
      id: clientId,
      title: "Remove a Client",
      contentText: "Are you sure you want to remove this client?",
      action: `systemusers/${clientId}`,
    });
  };
  useEffect(() => {
    if (actionData) {
      if (actionData?.data?.message) {
        toast.success(actionData?.data?.message);
        setLoading(false);
        setOpenModal(false);
      }
      if (actionData?.error) {
        toast.error(actionData?.error?.error?.message);
        setLoading(false);
      }
    }
  }, [actionData]);

  useEffect(() => {
    if (fetcher?.data?.error?.error?.message) {
      toast.error(fetcher?.data?.error?.error?.message);
    }
    if (fetcher?.data?.message) {
      toast.success(fetcher?.data?.message);
      setOpenModal(false);
      setDeleteDialog(DefaultDialogInfo);
    }
  }, [fetcher?.data]);

  return (
    <Box>
      <Navbar breadcrumbs={breadcrumbs} />
      <CustomizedTable
        columns={columns}
        data={loaderData}
        loading={loading || navigation.state === "loading" ? true : false}
        enableExport={true}
        customAction={(table: any) => (
          <Button variant="add" onClick={handleOpenModal}>
            Add User
          </Button>
        )}
      />

      <Box>
        <AddUserForm openModal={openModal} closeModal={handleCloseModal} />
      </Box>
      <DeleteAlert
        deleteDialog={deleteDialog}
        setDeleteDialog={setDeleteDialog}
        fetcher={fetcher}
      />
      <Outlet />
    </Box>
  );
};

export default SystemUsers;
