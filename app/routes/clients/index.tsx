import { Box, Button, Typography } from "@mui/material";
import type { Client } from "@prisma/client";
import { Status } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import type { MRT_ColumnDef } from "material-react-table";
import moment from "moment-timezone";
import { useEffect, useMemo, useState } from "react";
import customErr, { Response } from "~/utils/handler.server";
// import {
//   createClient,
//   deleteClient,
//   getClients,
//   updateClientById,
// } from "..//services/Client/Client.server";
import { authenticator } from "~/services/auth.server";
import {
  CustomizedTable,
  RowActions,
  StatusUpdate,
} from "~/src/components/Table";
import FilterModes from "~/src/components/Table/CustomFilter";
import DateFilter from "~/src/components/Table/DatePicker";
import canUser from "~/utils/casl/ability";
import { errorHandler } from "~/utils/handler.server";
import {
  clientSchema,
  clientSchemaForUpdate,
} from "~/utils/schema/clientSchema";
import { ClientForm } from "~/src/components/Forms";
import { formHandler } from "~/utils/formHandler";
import { toast } from "react-toastify";
import type { DeleteDialogType } from "~/src/components/DeleteAlert";
import DeleteAlert from "~/src/components/DeleteAlert";
import {
  createClient,
  deleteClient,
  getClients,
  updateClientById,
} from "~/services/Client/Client.server";
import palette from "~/src/theme/palette";
import Navbar from "~/src/components/Layout/Navbar";

// import {
//     createClient,
//     deleteClient,
//     getClients,
//     updateClientById,
// } from '../../services/Client/Client.server'

/**
 * Loader function to fetch clients.
 * @async function loader
 * @param request The incoming HTTP request.
 * @param params The URL params for the current route.
 * @returns The response data for role route.
 */
export const loader: LoaderFunction = async ({ request }) => {
  try {
    // Authenticate the user
    const user = await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    });

    console.log({ user });
    // Check if the user can create a client
    const canCreate = (await canUser(user.id, "create", "Client", {})) as any;

    // Get all clients
    let clients;
    clients = (await getClients(request, user.id)) as any;

    // console.log({ before: clients });

    if (clients?.status === 404) {
      // const test = await clients.json()
      // console.log({ data: test });
      return json(
        Response({
          data: {
            canCreate: canCreate?.status === 200,
            user,
          },
          error: {
            error: {
              message: "No clients found",
            },
          },
        })
      );
    }
    console.log({ clients });
    return json(
      Response({
        data: {
          ...clients,
          canCreate: canCreate?.status === 200,
          user,
        },
      })
    );
  } catch (error) {
    console.log("Error occured loading clients");
    console.dir(error, { depth: null });
    return errorHandler(error);
  }
};

/**
 * Action function perform a specific operation on a client.
 * @async function action
 * @param {Object} context - The context object.
 * @param {Request} context.request - The HTTP request.
 * @returns {Promise<Response>} A Promise that resolves to a response.
 * @throws {Error} Throws an error if the operation fails.
 */
export const action: ActionFunction = async ({ request }) => {
  try {
    const user = await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    });
    let response;
    const url = new URL(request.url);
    const clientId = url.searchParams.get("clientId") as string;
    console.log({ clientId });
    switch (request.method) {
      case "POST":
        const addClientData = (await formHandler(request, clientSchema)) as any;
        if (!addClientData?.success) {
          return addClientData;
        }
        response = await createClient(addClientData?.data, user.id);
        break;
      case "PATCH":
        const editClientData = (await formHandler(
          request,
          clientSchemaForUpdate
        )) as any;
        if (!editClientData?.success) {
          return editClientData;
        }
        response = await updateClientById(
          clientId,
          editClientData?.data,
          user.id
        );
        break;
      case "DELETE":
        response = await deleteClient(clientId, user.id);
        break;
      default:
        throw new customErr("Custom_Error", "Unsupported action!", 403);
    }
    console.log({ response });
    return response;
  } catch (error: any) {
    console.error("error occured creating client");
    console.dir(error, { depth: null });
    return errorHandler(error);
  }
};

const breadcrumbs = [
  <Typography
    key={"1"}
    variant="h6"
    color={palette.primary.main}
    fontSize={"bold"}
  >
    Clients
  </Typography>,
];
export const DefaultDialogInfo = {
  open: false,
  id: "",
  title: "Remove a Client",
  contentText: "Are you sure you want to remove this client?",
  action: "clients",
};
/**
 * Renders the Clients component.
 * @returns {JSX.Element} JSX element containing the clients table.
 */
const Clients = () => {
  const loaderData = useLoaderData<typeof loader>();
  const [actionData, setActionData] = useState(null);
  const [deleteDialog, setDeleteDialog] =
    useState<DeleteDialogType>(DefaultDialogInfo);
  const [editData, setEditData] = useState({});
  const fetcher = useFetcher();
  const [openModal, setOpenModal] = useState(false);
  const navigation = useNavigation();
  const columns = useMemo<MRT_ColumnDef<Client>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "promotionText",
        header: "Promoation Text",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "url",
        header: "Customer URL",
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
        accessorFn: (originalRow) =>
          moment(originalRow.createdAt).format("lll"),
        id: "createdAt",
        header: "Created At",
        size: 220,
        filterVariant: "date" as any,
        renderColumnFilterModeMenuItems: FilterModes,
        Filter: (props) => <DateFilter {...props} />,
      },
      {
        accessorFn: (originalRow) =>
          moment(originalRow.updatedAt).format("lll"),
        id: "updatedAt",
        header: "Updated At",
        size: 220,
        filterVariant: "date" as any,
        renderColumnFilterModeMenuItems: FilterModes,
        Filter: (props) => <DateFilter {...props} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        filterVariant: "multi-select",
        renderColumnFilterModeMenuItems: FilterModes,
        filterSelectOptions: Object.keys(Status).map((status) => {
          return {
            text: status,
            value: status,
          };
        }),
        size: 220,
        Cell: ({ row }) => (
          <StatusUpdate
            row={row}
            route={`/clients?clientId=${row.original.id}`}
          />
        ),
      },
      {
        accessorKey: "actions" as any,
        header: "Actions",
        enableSorting: false,
        flex: 1,
        size: 200,
        enableColumnFilter: false,
        Cell: ({ row, table }: any) => (
          <RowActions
            row={row}
            viewDetail={false}
            moreDetails={true}
            page="clients"
            handleDelete={handleDelete}
            handleEdit={handleModal}
            setEditData={setEditData}
            routeMenus={[
              {
                ability: row?.original?.canViewForms,
                route: "forms",
                menuItem: "Forms",
              },
              {
                ability: row?.original?.canViewRewards,
                route: "rewards",
                menuItem: "Rewards",
              },
              {
                ability: row?.original?.canViewUsers,
                route: "users",
                menuItem: "Users",
              },
              {
                ability: row?.original?.canViewSubmissions,
                route: "submissions",
                menuItem: "Submissions",
              },
              {
                ability: row?.original?.canViewSystemUsers,
                route: "systemusers",
                menuItem: "System Users",
              },
            ]}
          />
        ),
      },
    ],
    []
  );

  useEffect(() => {
    if (fetcher?.data?.error?.error?.message) {
      toast.error(fetcher?.data?.error?.error?.message);
    }
    if (fetcher?.data?.message) {
      toast.success(fetcher?.data?.message);
      setOpenModal(false);
      setEditData({});
      setDeleteDialog(DefaultDialogInfo);
    }
    if (fetcher?.data) setActionData(fetcher?.data);
  }, [fetcher?.data]);

<<<<<<< HEAD
  const handleModal = (row: any) => {
    setEditData(row);
    setOpenModal(true);
  };
=======
    return (
        <Box m={2}>
            <CustomizedTable
                columns={columns}
                data={loaderData}
                exportFileName="Clients"
                enableExport={true}
                loading={navigation.state === 'loading' ? true : false}
                customAction={(table: any) => (
                    <Button
                        variant="add"
                        onClick={() => handleModal(undefined)}
                    >
                        Add Client
                    </Button>
                )}
            />
            <ClientForm
                openModal={openModal}
                actionData={actionData}
                setActionData={setActionData}
                editData={editData}
                setOpenModal={setOpenModal}
                fetcher={fetcher}
            />
            <DeleteAlert
                deleteDialog={deleteDialog}
                setDeleteDialog={setDeleteDialog}
                fetcher={fetcher}
            />
        </Box>
    )
}
>>>>>>> dev

  const handleDelete = (clientId: any) => {
    setDeleteDialog({
      open: true,
      id: clientId,
      title: "Remove a Client",
      contentText: "Are you sure you want to remove this client?",
      action: `clients?clientId=${clientId}`,
    });
  };

  return (
    <Box m={2}>
      <Navbar breadcrumbs={breadcrumbs} />
      <CustomizedTable
        columns={columns}
        data={loaderData}
        page="Client"
        exportFileName="Clients"
        enableExport={true}
        loading={navigation.state === "loading" ? true : false}
        customAction={(table: any) => (
          <Button variant="add" onClick={() => handleModal(undefined)}>
            Add Client
          </Button>
        )}
      />
      <ClientForm
        openModal={openModal}
        actionData={actionData}
        setActionData={setActionData}
        editData={editData}
        setOpenModal={setOpenModal}
        fetcher={fetcher}
      />
      <DeleteAlert
        deleteDialog={deleteDialog}
        setDeleteDialog={setDeleteDialog}
        fetcher={fetcher}
      />
    </Box>
  );
};

export default Clients;
