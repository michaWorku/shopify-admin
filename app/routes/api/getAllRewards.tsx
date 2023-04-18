import { LoaderFunction, json } from "@remix-run/node";
import { getAllRewards } from "~/services/Reward/Reward.server";
import { Response, errorHandler } from "~/utils/handler.server";

/**
 * Loader function to fetch rewards of a client.
 * @async function loader
 * @param request The incoming HTTP request.
 * @param params The URL params for the current route.
 * @returns The response data for reward route.
 */
export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    // Get all rewards
    const rewards = (await getAllRewards(request)) as any;

    if (rewards?.status === 404) {
      return json(
        Response({
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
        },
      })
    );
  } catch (error) {
    console.log("Error occured loading rewards");
    console.dir(error, { depth: null });
    return errorHandler(error);
  }
};
