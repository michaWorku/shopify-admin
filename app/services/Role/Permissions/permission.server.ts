import { Permission } from "@prisma/client"
import { db } from "~/services/db.server"
import customErr, { Response, ResponseType, errorHandler } from "../../../utils/handler.server"
import { json } from "@remix-run/node"
import canUser from "~/utils/casl/ability"

/**
 * Get user permissions for which the role is active
 * @async
 * @function getAllPermissions
 * @param {string} userId - The ID of the user
 * @returns {Promise<Permission[]>}}
 */
export const getUserPermissions = async (userId: string): Promise<Permission[]> => {
    try {
        const permissions = await db.permission.findMany({
            where: {
                roles: {
                    every: {
                        role: {
                            status: "ACTIVE",
                            users: {
                                some: {
                                    user: {
                                        id: userId
                                    }
                                }
                            }
                        },
                    }
                },

            },
        })

        let filteredPermissions: any = []
        permissions?.map((elt: any) => {
            const filtered = Object.fromEntries(
                Object.entries(elt.permission).filter(
                    ([key, value]: any) => {
                        if (
                            (key.includes('action') && value) ||
                            (key.includes('subject') && value) ||
                            (key.includes('conditions') && value) ||
                            (key.includes('fields') && value.length)
                        ) {
                            return { key: value }
                        }
                    }
                )
            )
            if (!!filtered) {
                filteredPermissions.push(filtered)
            }
        })

        if (!!filteredPermissions) throw new customErr('casl_Bad_Request', 'User has got no permissions', 404)
        return filteredPermissions
    } catch (err) {
        return errorHandler(err);
    }
}

/**
 * Get all permissions with action not 'manage' and subject not 'all'
 * @async
 * @function getAllPermissions
 * @returns {Promise<object>} Object containing the permissions data
 */
export const getAllPermissions = async () => {
    try {
        const permissions = await db.permission.findMany({
            where: {
                action: {
                    not: 'manage'
                },
                subject: {
                    not: 'all'
                }
            },
        });
        return json(Response({ data: permissions }), { status: 200 });
    } catch (error: any) {
        console.error(`Error in getAllPermissions: ${error.message}`);
        return errorHandler(error);
    }
};

/**
 * Get a permission by ID.
 * @async
 * @function getPermissionById
 * @param id - The ID of the permission to retrieve.
 *
 * @returns The permission, or null if no permission was found with the given ID.
 */
export const getPermissionById = async (id: string) => {
    try {
        const permission = await db.permission.findUnique({
            where: {
                id,
            },
        });

        return json(Response({ data: permission }), { status: 200 });
    } catch (error) {
        console.error(`Error getting permission with ID ${id}: ${error}`);
        return errorHandler(error);
    }
};

/**
 * Get all permissions associated with the given entity
 * @async
 * @function getAllEntityPermissions
 * @param entityKey The entity key to filter permissions by
 * @param entityId The ID of the entity to retrieve permissions for
 * @returns A Promise resolving to an array of permission objects
 * @throws An error if the provided entity key is invalid or if there's an error querying the database
 */
export const getAllEntityPermissions = async (entityKey: string, entityId: string) => {
    try {
        if (!isValidEntityKey(entityKey)) {
            throw new Error(`Invalid entity key: ${entityKey}`)
        }

        const permissions = await db.permission.findMany({
            where: {
                conditions: {
                    path: [entityKey],
                    equals: entityId,
                },
            },
        })

        return Response({
            data: permissions,
        })
    } catch (err) {
        console.error(`Error getting permissions for entity ${entityKey} with ID ${entityId}: ${err}`)
        return errorHandler(err);
    }
}

/**
* Retrieves permissions of a user for a specific entity identified by its entity key and ID
* @async
* @function getUserEntityPermissions
* @param {string} userId - The ID of the user whose permissions are to be retrieved
* @param {string} entityKey - The entity key of the entity for which permissions are to be retrieved
* @param {string} entityId - The ID of the entity for which permissions are to be retrieved
* @returns {Promise} A Promise object representing the permissions of the user for the entity
*/
export const getUserEntityPermissions = async (userId: string, entityKey: string, entityId: string) => {
    try {
        if (!isValidEntityKey(entityKey)) {
            throw new Error(`Invalid entity key: ${entityKey}`)
        }
        const permissions = await db.permission.findMany({
            where: {
                roles: {
                    some: {
                        role: {
                            users: {
                                some: {
                                    user: {
                                        id: userId
                                    }
                                }
                            }
                        }
                    }
                },
                conditions: {
                    path: [entityKey],
                    equals: entityId,
                },
            },
        })

        return Response({
            data: permissions,
        })
    } catch (error) {
        return errorHandler(error)
    }
}

/**
 * Retrieves all system permissions that are not related to a specific entity or have a non-default value.
 * @async
 * @function getAllSystemPermission
 * @returns {Promise<Array>} A Promise that resolves to an array of Permission objects.
 */
export const getAllSystemPermissions = async () => {
    try {
        const permissions = await db.permission.findMany({
            where: {
                OR: [
                    { conditions: { equals: {} } },
                    { conditions: { path: ['edit_full'], equals: false } },
                    { conditions: { path: ['delete_full'], equals: false } },
                ],
                action: { not: 'manage' },
                subject: { not: 'all' },
            },
        });
        return Response({ data: permissions });
    } catch (err) {
        return errorHandler(err);
    }
};

/**
 * Retrieves all system permissions assigned to a user.
 * @async
 * @function getUserSystemPermissions
 * @param {string} userId - The ID of the user to retrieve system permissions for.
 * @returns {Promise<{ data: object[] }>} A Promise that resolves to an object containing an array of permissions.
 * @throws {Error} If an error occurs while retrieving the permissions.
 */
export const getUserSystemPermissions = async (userId: string) => {
    try {
        const permissions = await db.permission.findMany({
            where: {
                roles: {
                    some: {
                        role: {
                            users: {
                                some: {
                                    user: {
                                        id: userId
                                    }
                                }
                            }
                        }
                    }
                },
                conditions: {
                    equals: {}
                },
                action: {
                    not: 'manage'
                },
                subject: {
                    not: 'all'
                }
            }
        });

        return Response({ data: permissions });
    } catch (err) {
        return errorHandler(err);
    }
};

/**
* Checks if a given string is a valid entity key
* @async
* @function isValidEntityKey
* @param entityKey The entity key to validate
* @returns True if the entity key is valid, false otherwise
*/
export const isValidEntityKey = (entityKey: string): boolean => {
    // Check if the entity key is between 3 and 50 characters long
    if (entityKey.length < 3 || entityKey.length > 50) {
        return false;
    }

    // Check if the entity key only contains alphanumeric characters and underscores
    const regex = /^[a-zA-Z0-9_]+$/;
    return regex.test(entityKey);
}

/**
 * Get entity permissions for a user.
 *
 * @async
 * @function getEntityPermissions
 * @param {string} userId - The user ID.
 * @param {string} entityKey - The entity key.
 * @param {any[]} entities - An array of entities to get permissions for.
 * @returns {Promise<Object>} An object with the entity permissions.
 * @throws {Error} Throws an error if the operation fails.
 */
 export const getEntityPermissions = async (
    userId: string,
    entityKey: string,
    entities: any
  ) => {
    try {
      const iCanViewAll = await canUser(userId, 'read', 'Permission', {})
      let permissions: any = {}
  
      const getPermissionByEntity = async (item: any) => {
        const permission = iCanViewAll?.status === 200 ?
          await getAllEntityPermissions(entityKey, item.id) :
          await getUserEntityPermissions(userId, entityKey, item.id)
  
        return permission?.data?.length ?
          { [item.name]: permission } :
          { [item.name]: {} }
      }
  
      const promises = entities?.map(getPermissionByEntity)
      permissions = Object.assign({}, ...(await Promise.all(promises)))
  
      const canCreateRoleWithPermission = async (permission: any) => {
        const canCreateRole = await canUser(
          userId,
          'create',
          'Role',
          permission.conditions
        )
        return canCreateRole?.status === 200
      }
  
      const setCanCreateFlag = async (permission: any) => {
        permission.canCreate = await canCreateRoleWithPermission(permission)
        return permission
      }
  
      const pro = Object.keys(permissions).map(async (entity: any) => {
        if (permissions[entity]?.data) {
          permissions[entity].data = await Promise.all(
            permissions[entity].data.map(setCanCreateFlag)
          )
        }
      })
  
      await Promise.all(pro)
      return Response({data:permissions})
    } catch (e) {
      return errorHandler(e)
    }
  }
  
  /**
 * Fetches system permissions for a given user, including information on whether the user
 * can create roles with each permission.
 * @async
 * @function getSystemPermissions
 * @param {string} userId - The ID of the user to fetch permissions for.
 * @returns {Promise<object>} - An object containing an array of permission objects and a boolean
 * indicating whether the user can create roles with each permission.
 */
export const getSystemPermissions = async (userId: string) => {
    try {
        // Check if the user can view all permissions or only their own
        const iCanViewAll = await canUser(userId, 'read', 'Permission', {})
        let permissionsData: any

        if (iCanViewAll?.status === 200) {
            // Fetch all permissions if the user can view all
            permissionsData = await getAllSystemPermissions()
        } else if (iCanViewAll?.status === 403) {
            // Otherwise, fetch the user's permissions
            permissionsData = await getUserSystemPermissions(userId)
        } else {
            return iCanViewAll
        }

        // Check whether the user can create roles with each permission
        const permissionPromises = permissionsData?.data?.map(
            async (permission:any, index:number) => {
                const canCreateRoleWithPermission = await canUser(
                    userId,
                    'create',
                    'Role',
                    permission.conditions
                )

                // Set the "canCreate" property for each permission based on whether the user can create a role
                if (canCreateRoleWithPermission?.status === 200) {
                    permissionsData.data[index] = {
                        ...permissionsData.data[index],
                        canCreate: true,
                    }
                } else {
                    permissionsData.data[index] = {
                        ...permissionsData.data[index],
                        canCreate: false,
                    }
                }
            }
        )
        await Promise.all(permissionPromises)

        return Response({ data: permissionsData })
    } catch (error) {
        return errorHandler(error)
    }
}
