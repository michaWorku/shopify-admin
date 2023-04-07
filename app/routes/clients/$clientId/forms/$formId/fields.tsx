import { Box, Button } from "@mui/material";
import MaterialReactTable from "material-react-table";
import { DynamicForm, DynamicFormField, Status } from "@prisma/client";
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import {
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigation,
} from "@remix-run/react";
import { MRT_ColumnDef } from "material-react-table";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
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
  deleteDynamicFormField,
  getDynamicFormByField,
  updateDynamicFormField,
} from "~/services/Form/Form.server";
import { DynamicFormField as AddDynamicFormField } from "~/src/components/";
import {
  dynamicFormFieldSchema,
  dynamicFormSchema,
} from "~/utils/schema/dynamicFormSchema";

/**
 * Loader function to fetch dynamic form fields.
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
    // Check if the user can create a dynamic form field
    const canCreate = (await canUser(
      user?.id,
      "create",
      "DynamicFormField",
      {}
    )) as any;

    // Get dynamic form with formId
    let dynamicForm;
    dynamicForm = (await getDynamicFormByField(params.formId as string)) as any;

    console.dir({ before: dynamicForm }, { depth: null });

    if (dynamicForm?.status === 404) {
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
    console.log({ dynamicForm });
    return json(
      Response({
        data: {
          data: dynamicForm?.data?.fields.map((field: any) => ({
            ...field,
            canEdit: true,
            canDelete: true,
          })),
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
 * Action function performs a specific operation on a dynamic form field. 
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

    switch (request.method) {
      case "POST":
      case "PATCH":
        const editDynamicFormData = (await formHandler(
          request,
          dynamicFormFieldSchema
        )) as any;
        console.log({ status: editDynamicFormData?.success });
        if (!editDynamicFormData?.success) {
          return editDynamicFormData;
        }
        response = await updateDynamicFormField(
          params.formId as string,
          editDynamicFormData?.data,
          user.id,
          params.clientId as string
        );
        break;
      case "DELETE":
        const url = new URL(request.url);
        const fieldId = url.searchParams.get("fieldId") as string;
        response = await deleteDynamicFormField(
          params.formId as string,
          fieldId,
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
  title: "Remove a Form Rield",
  contentText: "Are you sure you want to remove this form field?",
  action: "forms",
};
/**
 * Renders the FormFieldss component.
 * @returns {JSX.Element} JSX element containing the clients table.
 */
const FormFields = () => {
  const loaderData = useLoaderData<typeof loader>();
  const location = useLocation();
  const [actionData, setActionData] = useState(null);
  const [deleteDialog, setDeleteDialog] =
    useState<DeleteDialogType>(DefaultDialogInfo);
  const [editData, setEditData] = useState<undefined | null>(null);
  const fetcher = useFetcher();
  const [openModal, setOpenModal] = useState(false);
  const navigation = useNavigation();
  const columns = useMemo<MRT_ColumnDef<DynamicFormField>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "label",
        header: "Label",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "description",
        header: "Description",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "type",
        header: "Type",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "required",
        header: "Required",
        renderColumnFilterModeMenuItems: FilterModes,
        Cell: ({ cell }) => (
          <> {cell?.getValue<boolean>() ? <DoneIcon /> : <ClearIcon />} </>
        ),
      },
      {
        accessorKey: "placeholder",
        header: "Place holder",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "defaultValue",
        header: "Default Value",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "order",
        header: "Order",
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
            moreDetails={false}
            page="clients"
            handleDelete={handleDelete}
            handleEdit={handleModal}
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

  const handleModal = (row: any) => {
    setEditData(row);
    setOpenModal(true);
  };

  const handleDelete = (fieldId: any) => {
    setDeleteDialog({
      open: true,
      id: fieldId,
      title: "Remove a Form Rield",
      contentText: "Are you sure you want to remove this form field?",
      action: `${location.pathname}?fieldId=${fieldId}`,
    });
  };

  return (
    <Box m={2}>
      <MaterialReactTable
        columns={columns}
        data={loaderData?.data?.data}
        enableColumnFilterModes
        enableColumnResizing
        enableStickyHeader
        enableColumnOrdering
        enableRowSelection
        muiLinearProgressProps={({ isTopToolbar }: any) => ({
          sx: {
            display: isTopToolbar ? "block" : "none",
          },
        })}
        state={{
          showAlertBanner: loaderData?.error,
          showProgressBars: navigation.state === "loading" ? true : false,
        }}
        initialState={{
          columnPinning: {
            right: ["status", "actions"],
          },
        }}
        muiToolbarAlertBannerProps={
          loaderData?.error
            ? {
                color: "error",
                children: loaderData?.error?.error.message || "Network Error!",
              }
            : undefined
        }
        renderTopToolbarCustomActions={({ table }) =>
          loaderData?.data?.canCreate && (
            <Button variant="add" onClick={() => handleModal(undefined)}>
              Add Field
            </Button>
          )
        }
        // renderToolbarInternalActions={({ table }) => (
        //   <CustomToolbar
        //     table={table}
        //     data={loaderData?.data?[0]?.fields}
        //     enableExport={enableExport}
        //     exportType={exportType}
        //     setExportType={setExportType}
        //     exportFileName={exportFileName}
        //   />
        // )}
        muiTableHeadCellProps={({ table, column }) => {
          return {
            sx: {
              "& .MuiTableCell-root": {
                boxShadow:
                  table.getState().columnPinning?.right?.[0] === column?.id
                    ? "-7px 0px 10px -1.7px lightgray"
                    : table
                        .getState()
                        .columnPinning?.left?.some((el) => el === column.id)
                    ? "7px 0px 10px -1.7px lightgray"
                    : "none",
              },
              "& .MuiButtonBase-root": {
                "& .PrivateSwitchBase-input": {
                  backgroundColor: "red",
                },
              },
            },
          };
        }}
        muiTableBodyCellProps={({ table, column }) => {
          return {
            sx: {
              "& .MuiTableCell-root": {
                boxShadow:
                  table.getState().columnPinning?.right?.[0] === column?.id
                    ? "-7px 0px 10px -1.7px lightgray"
                    : table
                        .getState()
                        .columnPinning?.left?.some((el) => el === column.id)
                    ? "7px 0px 10px -1.7px lightgray"
                    : "none",
              },
            },
          };
        }}
      />
      {/* <CustomizedTable
        columns={columns}
        data={loaderData?.data?.data[0]?.fields}
        page="Client"
        exportFileName="Forms"
        enableExport={true}
        loading={navigation.state === "loading" ? true : false}
        customAction={(table: any) => (
          <Button variant="add" onClick={()=>handleModal(undefined)}>
            Add Field
          </Button>
        )}
      /> */}
      <AddDynamicFormField
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

export default FormFields;