import { Box, Button } from "@mui/material";
import { DynamicForm, Reward, Status } from "@prisma/client";
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
import { RewardForm } from "~/src/components/Forms";
import {
  dynamicFormSchema,
} from "~/utils/schema/dynamicFormSchema";
import { createReward, deleteRewardById, getRewards, updateRewardById } from "~/services/Reward/Reward.server";
import { rewardSchema, updateRewardSchema } from "~/utils/schema/rewardSchema";

/**
 * Loader function to fetch rewards of a client.
 * @async function loader
 * @param request The incoming HTTP request.
 * @param params The URL params for the current route.
 * @returns The response data for reward route.
 */
export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    // Authenticate the user
    const user = await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    });

    console.log({ user, params });
    // Check if the user can create a reward
    const canCreate = (await canUser(
      user?.id,
      "create",
      "Reward",
      {}
    )) as any;

    // Get all dynamic forms and rewards
    let dynamicForms, rewards
    dynamicForms = (await getDynamicForms(
      request,
      user.id,
      params?.clientId as string
    )) as any;

    console.dir({ form: dynamicForms?.data });

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

   // Get all dynamic forms and rewards
    rewards = (await getRewards(
      request,
      user.id,
      params?.clientId as string
    )) as any;

    if (rewards?.status === 404) {
      // const test = await dynamicForms.json()
      // console.log({ data: test });
      return json(
        Response({
          data: {
            canCreate: canCreate?.status === 200,
            user,
            forms: dynamicForms?.data,
          },
          error: {
            error: {
              message: "No rewards found",
            },
          },
        })
      );
    }
    console.dir({ rewards });
    return json(
      Response({
        data: {
          ...rewards,
          forms: dynamicForms?.data,
          canCreate: canCreate?.status === 200,
          user,
        },
      })
    );
  } catch (error) {
    console.log("Error occured loading rewards");
    console.dir(error, { depth: null });
    return errorHandler(error);
  }
};

/**
 * Action function performs a specific operation on a reward.
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
    const rewardId = url.searchParams.get("rewardId") as string;
    console.log({ rewardId });
    switch (request.method) {
      case "POST":
        const addRewardData = (await formHandler(
          request,
          rewardSchema
        )) as any;
        console.log({ status: addRewardData?.success });
        if (!addRewardData?.success) {
          return addRewardData;
        }
        response = await createReward(
          addRewardData?.data,
          user.id,
          params.clientId as string
        );
        break;
      case "PATCH":
        const updateRewardData = (await formHandler(
          request,
          updateRewardSchema
        )) as any;
        console.log({ status: updateRewardData?.success, data: updateRewardData });
        if (!updateRewardData?.success) {
          return updateRewardData;
        }
        response = await updateRewardById(
          rewardId as string,
          updateRewardData?.data,
          params.clientId as string,
          user.id
        );
        break;
      case "DELETE":
        response = await deleteRewardById(
          rewardId as string,
          params.clientId as string,
          user.id,
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
  title: "Remove a Reward",
  contentText: "Are you sure you want to remove this reward?",
  action: "rewards",
};
/**
 * Renders the Reward component.
 * @returns {JSX.Element} JSX element containing the rewards table.
 */
const Reward = () => {
  const loaderData = useLoaderData<typeof loader>();
  const location = useLocation();
  const [actionData, setActionData] = useState(null);
  const [deleteDialog, setDeleteDialog] =
    useState<DeleteDialogType>(DefaultDialogInfo);
  const [editData, setEditData] = useState<undefined | null>(null);
  const fetcher = useFetcher();
  const [openModal, setOpenModal] = useState(false);
  const navigation = useNavigation();
  const columns = useMemo<MRT_ColumnDef<Reward>[]>(
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
        accessorKey: "rewardGiven",
        header: "Reward Given",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "rewardTaken",
        header: "Reward Taken",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "plan",
        header: "Plan",
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
            route={`${location.pathname}?rewardId=${row.original.id}`}
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
            page="rewards"
            handleDelete={handleDelete}
            handleEdit={handleModal}
            routeMenus={[
              {
                ability: row?.original?.canViewUsers,
                route: "users",
                menuItem: "Users",
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

  const handleDelete = (rewardId: any) => {
    setDeleteDialog({
      open: true,
      id: rewardId,
      title: "Remove a Reward",
      contentText: "Are you sure you want to remove this reward?",
      action: `${location.pathname}?rewardId=${rewardId}`,
    });
  };

  return (
    <Box m={2}>
      <CustomizedTable
        columns={columns}
        data={loaderData}
        page="reards"
        exportFileName="Rewards"
        enableExport={true}
        loading={navigation.state === "loading" ? true : false}
        customAction={(table: any) => (
          <Button variant="add" onClick={()=>handleModal(undefined)}>
            Add Reward
          </Button>
        )}
      />
      <RewardForm
        openModal={openModal}
        actionData={actionData}
        setActionData={setActionData}
        editData={editData}
        setEditData={setEditData}
        setOpenModal={setOpenModal}
        fetcher={fetcher}
        forms={loaderData?.data?.forms}
      />
      <DeleteAlert
        deleteDialog={deleteDialog}
        setDeleteDialog={setDeleteDialog}
        fetcher={fetcher}
      />
    </Box>
  );
};

export default Reward;
