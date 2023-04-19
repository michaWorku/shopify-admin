import { Box } from "@mui/material";
import type { User } from "@prisma/client";
import { Reward } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigation,
} from "@remix-run/react";
import type { MRT_ColumnDef } from "material-react-table";
import moment from "moment-timezone";
import { useEffect, useMemo, useState } from "react";
import customErr, { Response } from "~/utils/handler.server";
import { authenticator } from "~/services/auth.server";
import { CustomizedTable } from "~/src/components/Table";
import FilterModes from "~/src/components/Table/CustomFilter";
import DateFilter from "~/src/components/Table/DatePicker";
import canUser from "~/utils/casl/ability";
import { errorHandler } from "~/utils/handler.server";
import { toast } from "react-toastify";
import { getRewardUsers } from "~/services/Reward/Reward.server";
import { getClientUsers } from "~/services/Client/Client.server";

/**
 * Loader function to fetch users of a client.
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
    // Check if the user can read a client users
    const canRead = (await canUser(user?.id, "read", "User", {
      clientId: params?.clientId,
    })) as any;

    // Get all all users that get any reward of a client
    let clientUsers;
    clientUsers = (await getClientUsers(
      request,
      params?.clientId as string
    )) as any;

    console.dir({ form: clientUsers?.data });

    if (clientUsers?.status === 404) {
      // const test = await dynamicForms.json()
      // console.log({ data: test });
      return json(
        Response({
          data: {
            canRead: canRead?.status === 200,
            user,
          },
          error: {
            error: {
              message: "No users found",
            },
          },
        })
      );
    }

    return json(
      Response({
        data: {
          ...clientUsers,
          canRead: canRead?.status === 200,
          user,
        },
      })
    );
  } catch (error) {
    console.log("Error occured loading reward users");
    console.dir(error, { depth: null });
    return errorHandler(error);
  }
};

/**
 * Renders the Client User component.
 * @returns {JSX.Element} JSX element containing the client users table.
 */
const ClientUsers = () => {
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();
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
        accessorKey: "phone",
        header: "Phone",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "email",
        header: "Email",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "gender",
        header: "Gender",
        renderColumnFilterModeMenuItems: FilterModes,
      },
      {
        accessorKey: "birthDate",
        header: "Birth Date",
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
        exportFileName="Client Users"
        enableExport={true}
        loading={navigation.state === "loading" ? true : false}
      />
    </Box>
  );
};

export default ClientUsers;
