import { Response, errorHandler } from "~/utils/handler.server";
import { db } from "../db.server";

/**
 * Get all entities for the specified model.
 * @async function getAllEntities
 * @param {string} model - The name of the model to fetch data for.
 *
 * @returns {Promise} A Promise that resolves to the data for the specified model.
 * @throws {Error} If an invalid model is provided.
 */
export const getAllEntities = async (model: string): Promise<object> => {
    try {
        if (!model) {
            throw new Error("Invalid model provided");
        }

        const data = await (db as any)[model].findMany();
        const responseData = {
            data,
        };
        return Response(responseData);
    } catch (e) {
        return errorHandler(e);
    }
}


/**
 * Retrieves users of a given model based on user ID.
 * @async function getUserEnities
 * @param {string} model - The name of the model to search.
 * @param {string} userId - The ID of the user to search for.
 * @returns {Promise<object>} - The response data containing the found users.
 * @throws {Error} - If an invalid model is provided.
 */
 export const getUserEntities = async (model: string, userId: string): Promise<object> => {
    try {
        if (!model) {
            throw new Error("Invalid model provided");
        }

        const data = await (db as any)[model].findMany({
            where: {
                Users: {
                    some: {
                        User: {
                            id: userId,
                        },
                    },
                },
            },
        });
        const responseData = {
            data,
        };
        return Response(responseData);
    } catch (e) {
        return errorHandler(e);
    }
};
