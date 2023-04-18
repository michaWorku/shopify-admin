import { Box } from "@mui/material";
import type { DynamicFormSubmission, Reward, User } from "@prisma/client";
import { Status } from "@prisma/client";
import type { LoaderFunction} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import type { MRT_ColumnDef } from "material-react-table";
import moment from "moment-timezone";
import { useEffect, useMemo } from "react";
import  { Response } from "~/utils/handler.server";
import { authenticator } from "~/services/auth.server";
import { CustomizedTable } from "~/src/components/Table";
import FilterModes from "~/src/components/Table/CustomFilter";
import DateFilter from "~/src/components/Table/DatePicker";
import canUser from "~/utils/casl/ability";
import { errorHandler } from "~/utils/handler.server";
import { toast } from "react-toastify";
import { getRewardSubmissions } from "~/services/DynamicFormSubmission/DynamicFormSubmission.server";

/**
 * Loader function to fetch submissions of a reward.
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
    // Check if the user can read all reward submissions
    const canRead = (await canUser(user?.id, "read", "DynamicFormSubmission", {
      clientId: params?.clientId,
    })) as any;

    // Get all all users that get reward submission
    let clientSubmissions;
    clientSubmissions = (await getRewardSubmissions(
      request,
      params?.rewardId as string
    )) as any;

    console.dir({ form: clientSubmissions?.data });

    if (clientSubmissions?.status === 404) {
      return json(
        Response({
          data: {
            canRead: canRead?.status === 200,
            user,
          },
          error: {
            error: {
              message: "No submissions found",
            },
          },
        })
      );
    }

    return json(
      Response({
        data: {
          ...clientSubmissions,
          canRead: canRead?.status === 200,
          user,
        },
      })
    );
  } catch (error) {
    console.log("Error occured loading client submission users");
    console.dir(error, { depth: null });
    return errorHandler(error);
  }
};

/**
 * Renders the Reward Submission component.
 * @returns {JSX.Element} JSX element containing the client users table.
 */
const RewardSubmissions = () => {
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const columns = useMemo<
    MRT_ColumnDef<
      DynamicFormSubmission & {
        submittedBy: User;
        reward: Reward;
      }
    >[]
  >(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorFn: (originalRow) =>
          (originalRow?.submittedBy?.firstName || " ") +
          " " +
          (originalRow?.submittedBy?.middleName || " ") +
          " " +
          (originalRow?.submittedBy?.lastName || " "),
        id: "submittedBy",
        header: "Submitted By",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorFn: (originalRow) => originalRow?.reward?.id,
        accessorKey: "rewardId",
        header: "Reward Id",
        renderColumnFilterModeMenuItems: FilterModes,
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
        Cell: ({ cell }) => (
          <span
            style={{
              color:
                cell.getValue<string>() === "INACTIVE"
                  ? "#CC2727"
                  : cell.getValue<string>() === "PENDING"
                  ? "#CC2727"
                  : "#54D62C",
            }}
          >
            {cell.getValue<string>()}
          </span>
        ),
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
    ],
    []
  );

  useEffect(() => {
    if (loaderData?.data?.error?.error?.message) {
      toast.error(loaderData?.data?.error?.error?.message);
    }
  }, [loaderData]);

  return (
    <Box m={2}>
      <CustomizedTable
        columns={columns}
        data={loaderData}
        exportFileName="Reward Submissions"
        enableExport={true}
        loading={navigation.state === "loading" ? true : false}
        enableDetailPanel={true}
      />
    </Box>
  );
};

export default RewardSubmissions;