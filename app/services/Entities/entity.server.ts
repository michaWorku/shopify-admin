import { Response, errorHandler } from "~/utils/handler.server";
import { db } from "../db.server";
import canUser from "~/utils/casl/ability";

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

/**
 * Retrieves entities based on user permissions.
 * @param {string} userId - The ID of the user.
 * @param {string} entity - The name of the entity to retrieve.
 * @returns {Promise<object>} - An object containing the retrieved entities.
 * @throws {Error} - If an invalid model is provided.
 */
export const getEntities = async (userId: string, entity: string): Promise<object> => {
    try {
        // Check if a valid entity name is provided.
        if (!entity) {
            throw new Error("Invalid model provided");
        }

        // Check if the user has permission to view all entities.
        const iCanViewAll = await canUser(userId, 'read', 'Permission', {});

        let entities: any;

        if (iCanViewAll?.status === 200) {
            // Retrieve all entities if the user has permission to view all.
            entities = await getAllEntities(entity);
        } else if (iCanViewAll?.status === 403) {
            // Retrieve only the entities that the user has permission to view.
            entities = await getUserEntities(userId, entity);
        } else {
            // Return the permission error response.
            return iCanViewAll;
        }

        return entities;
    } catch (e) {
        return errorHandler(e);
    }
}
