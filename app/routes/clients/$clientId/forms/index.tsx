import { Box, Button } from "@mui/material";
import { DynamicForm, Status } from "@prisma/client";
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import {
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigation,
} from "@remix-run/react";
import { MRT_ColumnDef } from "material-react-table";
import moment from "moment-timezone";
import { useEffect, useMemo, useState } from "react";
import customErr, { Response } from "~/utils/handler.server";
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
import { formHandler } from "~/utils/formHandler";
import { toast } from "react-toastify";
import DeleteAlert, { DeleteDialogType } from "~/src/components/DeleteAlert";
import {
  createForm,
  deleteDynamicForm,
  getDynamicForms,
  updateDynamicFormById,
} from "~/services/Form/Form.server";
import { DynamicForm as AddDynamicForm } from "~/src/components/";
import {
  dynamicFormSchema,
} from "~/utils/schema/dynamicFormSchema";

/**
 * Loader function to fetch dynamic forms.
 * @async function loader
 * @param request The incoming HTTP request.
 * @param params The URL params for the current route.
 * @returns The response data for role route.
 */
export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    // Authenticate the user
    const user = await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    });

    console.log({ user, params });
    // Check if the user can create a dynamic form
    const canCreate = (await canUser(
      user?.id,
      "create",
      "DynamicForm",
      {}
    )) as any;

    // Get all dynamic forms
    let dynamicForms;
    dynamicForms = (await getDynamicForms(
      request,
      user.id,
      params?.clientId as string
    )) as any;

    console.log({ before: dynamicForms });

    if (dynamicForms?.status === 404) {
      // const test = await dynamicForms.json()
      // console.log({ data: test });
      return json(
        Response({
          data: {
            canCreate: canCreate?.status === 200,
            user,
          },
          error: {
            error: {
              message: "No dynamic forms found",
            },
          },
        })
      );
    }
    console.log({ dynamicForms });
    return json(
      Response({
        data: {
          ...dynamicForms,
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
 * Action function performs a specific operation on a dynamic form.
 * @async function action
 * @param {Object} context - The context object.
 * @param {Request} context.request - The HTTP request.
 * @returns {Promise<Response>} A Promise that resolves to a response.
 * @throws {Error} Throws an error if the operation fails.
*/
export const action: ActionFunction = async ({ request, params }) => {
  try {
    const user = await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    });
    let response;
    const url = new URL(request.url);
    const formId = url.searchParams.get("formId") as string;
    console.log({ formId });
    switch (request.method) {
      case "POST":
        const addDynamicFormData = (await formHandler(
          request,
          dynamicFormSchema
        )) as any;
        console.log({ status: addDynamicFormData?.success });
        if (!addDynamicFormData?.success) {
          return addDynamicFormData;
        }
        response = await createForm(
          addDynamicFormData?.data,
          user.id,
          params.clientId as string
        );
        break;
      case "PATCH":
        const editDynamicFormData = (await formHandler(
          request,
          dynamicFormSchema
        )) as any;
        console.log({ status: editDynamicFormData?.success });
        if (!editDynamicFormData?.success) {
          return editDynamicFormData;
        }
        response = await updateDynamicFormById(
          formId as string,
          editDynamicFormData?.data,
          user.id,
          params.clientId as string
        );
        break;
      case "DELETE":
        response = await deleteDynamicForm(
          formId as string,
          user.id,
          params.clientId as string
        );
        break;
      default:
        throw new customErr("Custom_Error", "Unsupported action!", 403);
    }
    console.log({ response });
    return response;
  } catch (error: any) {
    console.error("error occured performing operation on dynamic form");
    console.dir(error, { depth: null });
    return errorHandler(error);
  }
};

export const DefaultDialogInfo = {
  open: false,
  id: "",
  title: "Remove a Form",
  contentText: "Are you sure you want to remove this form?",
  action: "forms",
};
/**
 * Renders the Forms component.
 * @returns {JSX.Element} JSX element containing the clients table.
 */
const Forms = () => {
  const loaderData = useLoaderData<typeof loader>();
  const location = useLocation();
  const [actionData, setActionData] = useState(null);
  const [deleteDialog, setDeleteDialog] =
    useState<DeleteDialogType>(DefaultDialogInfo);
  const [editData, setEditData] = useState<undefined | null>(null);
  const fetcher = useFetcher();
  const [openModal, setOpenModal] = useState(false);
  const navigation = useNavigation();
  const columns = useMemo<MRT_ColumnDef<DynamicForm>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "description",
        header: "Description",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "createdBy",
        header: "Created By",
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
      // {
      //   accessorKey: "status",
      //   header: "Status",
      //   filterVariant: "multi-select",
      //   renderColumnFilterModeMenuItems: FilterModes,
      //   filterSelectOptions: Object.keys(Status).map((status) => {
      //     return {
      //       text: status,
      //       value: status,
      //     };
      //   }),
      //   size: 220,
      //   Cell: ({ row }) => (
      //     <StatusUpdate
      //       row={row}
      //       route={`/client?clientId=${row.original.id}`}
      //     />
      //   ),
      // },
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
            page="forms"
            handleDelete={handleDelete}
            handleEdit={handleModal}
            routeMenus={[
              {
                ability: row?.original?.canViewFormFields,
                route: "fields",
                menuItem: "Fields",
              },
            ]}
          />
        ),
      },
    ],
    []
  );

  useEffect(() => {
    console.log({ loaderData });
  }, [loaderData]);

  useEffect(() => {
    console.log({ fetcher });
    if (!!fetcher?.data?.error?.error?.message) {
      toast.error(fetcher?.data?.error?.error?.message);
    }
    if (!!fetcher?.data?.message) {
      toast.success(fetcher?.data?.message);
      setOpenModal(false);
      setEditData(undefined);
      setDeleteDialog(DefaultDialogInfo);
    }
    if (!!fetcher?.data) setActionData(fetcher?.data);
  }, [fetcher?.data]);

  const handleModal = (row:any) => {
    setEditData(row);
    setOpenModal(true);
  };

  const handleDelete = (formId: any) => {
    setDeleteDialog({
      open: true,
      id: formId,
      title: "Remove a Form",
      contentText: "Are you sure you want to remove this form?",
      action: `${location.pathname}?formId=${formId}`,
    });
  };

  return (
    <Box m={2}>
      <CustomizedTable
        columns={columns}
        data={loaderData}
        page="Form"
        exportFileName="Forms"
        enableExport={true}
        loading={navigation.state === "loading" ? true : false}
        customAction={(table: any) => (
          <Button variant="add" onClick={()=>handleModal(undefined)}>
            Add Form
          </Button>
        )}
      />
      <AddDynamicForm
        openModal={openModal}
        actionData={actionData}
        setActionData={setActionData}
        editData={editData}
        setEditData={setEditData}
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

export default Forms;