import { Response, errorHandler } from "~/utils/handler.server";
import { db } from "../db.server";
import canUser from "~/utils/casl/ability";
import { getAllEntityPermissions, getUserEntityPermissions } from "../Role/Permissions/permission.server";

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

/**
 * Retrieves entity permissions for a user based on their ID, entity key and list of entities
 * @async function getEntityPermissions
 * @param {string} userId - ID of the user for whom the permissions are being retrieved
 * @param {string} entityKey - Key of the entity for which permissions are being retrieved
 * @param {Array} entities - List of entities for which permissions are being retrieved
 * @returns {Promise<any>} - A promise that resolves to an object containing the retrieved permissions or rejects with an error
 */
 export const getEntityPermissions = async (
    userId: string,
    entityKey: string,
    entities: any[]
  ): Promise<any> => {
    try {
      const iCanViewAll = await canUser(userId, 'read', 'Permission', {});
      let permissions: any = {};
      if (iCanViewAll?.status === 200) {
        await Promise.all(
          entities?.map(async (item: any) => {
            const permission: any = await getAllEntityPermissions(
              entityKey,
              item?.id
            );
            if (permission?.data && permission?.data?.length) {
              permissions[item.name] = permission;
            } else {
              permissions[item.name] = {};
            }
          })
        );
      } else if (iCanViewAll?.status === 403) {
        await Promise.all(
          entities?.map(async (item: any) => {
            const permission: any = await getUserEntityPermissions(
              userId,
              entityKey,
              item?.id
            );
            if (permission?.data && permission?.data?.length) {
              permissions[item.name] = permission;
            } else {
              permissions[item.name] = {};
            }
          })
        );
      } else {
        return iCanViewAll;
      }
  
      const pro = Object.keys(permissions).map(async (entity: any) => {
        if (permissions[entity]?.data) {
          await Promise.all(
            permissions[entity]?.data?.map(
              async (permission: any, index: number) => {
                const canCreateRoleWithPermission = await canUser(
                  userId,
                  'create',
                  'Role',
                  permission.conditions
                );
                if (canCreateRoleWithPermission?.status === 200) {
                  permissions[entity].data[index] = {
                    ...permissions[entity].data[index],
                    canCreate: true,
                  };
                } else {
                  permissions[entity].data[index] = {
                    ...permissions[entity].data[index],
                    canCreate: false,
                  };
                }
              }
            )
          );
        }
      });
      await Promise.all(pro);
      return permissions;
    } catch (error) {
      throw errorHandler(error);
    }
  };
  
 /**
 * Check if an entity exists in the database by ID.
 * @async
 * @function checkEntityExist
 * @param {string} entityName - The name of the entity to check (e.g. "User", "Client").
 * @param {string} id - The ID of the entity to check.
 * @returns {Promise<boolean>} True if the entity exists, false otherwise.
 * @throws {Error} If the entity name is not recognized or the ID is invalid.
 */
export const checkEntityExist = async (entityName: string, id: string): Promise<boolean> => {
  try {
    const jsonSchema = require('../../../prisma/json-schema/json-schema.json')
    const entityIdSchema = jsonSchema.definitions?.[entityName]?.properties?.id
    if (!entityIdSchema) {
      throw new Error(`Unrecognized entity name: ${entityName}`)
    }
    if (typeof id !== entityIdSchema.type) {
      throw new Error(`Invalid ID format for entity ${entityName}: ${id}`)
    }
    const count = await (db as any)[entityName].count({
      where: {
        id,
        deletedAt: null
      }
    })
    return count > 0
  } catch (error) {
    return errorHandler(error)
  }
}
