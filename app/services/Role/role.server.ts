import { json } from '@remix-run/node'
import { db } from '../db.server'
import customErr, { Response, errorHandler } from '~/utils/handler.server'
import { Role } from '@prisma/client'
import getParams from '~/utils/params/getParams.server'
import { searchCombinedColumn } from '~/utils/params/search.server'
import { filterFunction } from '~/utils/params/filter.server'

/**
 * Creates a new role in the database.
 * @async
 * @function createRole
 * @param {string} userId - The ID of the user creating the role.
 * @param {object} roleData - The role data with an array of permission IDs associated with the role.
 * @returns {Promise<object>} The created role object.
 * @throws {Error} Throws an error if there's an issue creating the role.
 */
export const createRole = async (userId: string, roleData: any) => {

    try {
        if (!userId) {
            throw new customErr('Custom_Error', 'User ID is required', 404)
        }

        if (!roleData || !roleData.name || !roleData.permissions) {
            throw new customErr('Custom_Error', 'Role data is missing or invalid', 404);
        }

        const createdRole = await db.role.create({
            data: {
                name: roleData?.name,
                createdBy: userId,
                permissions: {
                    create: roleData?.permissions?.map((permissionId: string) => {
                        return {
                            permission: {
                                connect: {
                                    id: permissionId,
                                },
                            },
                        }
                    }),
                },
            },
        })

        return json(Response({ data: createdRole }), { status: 201, statusText: 'OK' })
    } catch (err) {
        return errorHandler(err)
    }
}

/**
 * Get a role by role ID.
 * @async
 * @function getRoleById
 * @param {string} roleId - The ID of the role to get.
 *
 * @returns {Promise<object>} The role object.
 * @throws {Error} If no role is found with the given ID.
 */
 export const getRoleById = async (roleId: string) => {
    if (!roleId) {
        throw new customErr('Custom_Error', 'Role ID is required', 404)
    }
    try {
        const role = await db.role.findUnique({
            where: {
                id: roleId,
            },
        })

        if (!role) {
            throw new customErr('Custom_Error',`Role not found with ID: ${roleId}`, 404)
        }

        return role
    } catch (err) {
        return errorHandler(err)
    }
}


/**
 * Retrieves all role from the database based on a scalar field.
 * @async
 * @function getRolesByScalarField
 * @param {string} fieldName - The name of the scalar field to search for (e.g. "name").
 * @param {any} fieldValue - The value of the scalar field to search for (e.g. "admin").
 * @returns {Promise<object>} The retrieved role object.
 * @throws {Error} Throws an error if there's an issue retrieving the role.
 */
export const getRolesByScalarField = async (fieldName: string, fieldValue: string) => {
    const validScalarFields = ['name', 'description', 'createdBy', 'status'];

    try {
        if (!validScalarFields.includes(fieldName)) {
            throw new customErr('Custom_Error', `Invalid field name provided`, 400);
        }

        const role = await db.role.findMany({
            where: {
                [fieldName]: fieldValue,
            },
            include: {
                users: {
                    include: {
                        user: true
                    }
                },
                permissions: {
                    include: {
                        permission: true
                    }
                }
            },
        });

        if (!role) {
            throw new customErr('Custom_Error', `Role with ${fieldName} ${fieldValue} not found`, 404);
        }

        return json(Response({ data: role }), { status: 200 });
    } catch (err) {
        return errorHandler(err);
    }
};

/**
 * Retrieve roles of a user.
 * @async
 * @function getUserRoles
 * @param {string} userId - The ID of the user.
 * @returns {Promise<obj>} The retrieved user roles.
 * @throws {Error} Throws an error if the provided user id is invalid.
 */
export const getUserRoles = async (userId: string) => {
    if (!userId) {
        throw new customErr('Custom_Error', 'User ID is required', 404)
    }
    try {
        const roles = await db.role.findMany({
            where: {
                users: {
                    some: {
                        userId
                    }
                }
            },
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            },
        });

        return json(Response({ data: roles }), { status: 200 });
    } catch (err) {
        return errorHandler(err);
    }
};

/**
 * Retrieve all roles
 * @async
 * @function getAllRoles
 * @throws {Error} Throws an error if it fails to retrieve roles.
 */
export const getAllRoless = async () => {
    try {
        return await db.role.findMany()
    } catch (error) {
        return errorHandler(error)
    }
}

/**

Retrieves all roles created by a specific user based on the given userId.
@async
@function getAllRoles
@param {Request} request - The request object received from the client.
@param {string} userId - The ID of the user for whom to retrieve the roles.
@returns {Promise<Object>} - The response object containing the retrieved roles data and metadata.
@throws {Error} - Throws an error if the retrieval of the roles data fails.
*/
export const getAllRoles = async (request: Request, userId: string) => {
    try {
        if (!userId) {
            throw new customErr('Custom_Error', 'User ID is required', 404)
        }

        const { sortType, sortField, skip, take, pageNo, search, filter } =
            getParams(request)
        const searchParams = searchCombinedColumn(search, ['name', 'createdBy', 'description'])
        const filterParams = filterFunction(filter, 'Role')

        let roles = []
        const roleCount = await db.role.count({
            where: {
                ...searchParams,
                ...filterParams,
                createdBy: userId,
            },
        })
        if (!!roleCount) {
            roles = await db.role.findMany({
                take,
                skip,
                orderBy: [
                    {
                        [sortField]: sortType,
                    },
                ],
                where: {
                    createdBy: userId,
                    ...searchParams,
                    ...filterParams,
                },
            })

            return {
                data: roles,
                metaData: {
                    page: pageNo,
                    pageSize: take,
                    sort: [sortField, sortType],
                    searchVal: search,
                    filter,
                    total: roleCount,
                }
            }

        }
        throw new customErr('Custom_Error', 'Role not found', 404)
    } catch (err) {
        return errorHandler(err);
    }
}

/**
 * Updates a role by ID
 * @async
 * @function updatedRoleById
 * @param {string} roleId - ID of the role to update
 * @param {object} data - Updated role data
 * @returns {Promise<object>} Updated role object
 * @throws {Error} If no role found with given ID
 */
export const updateRoleById = async (roleId: string, data: any): Promise<any> => {
    try {
        const updatedRole = await db.role.update({
            where: { id: roleId },
            data
        });
        return json(Response({
            data: updatedRole
        }), {
            status: 200
        });
    } catch (err) {
        return errorHandler(err);
    }
};

/**
 * Updates the permissions of a role by ID
 * @async
 * @function updateRolePermissions
 * @param {string} roleId - The ID of the role to update
 * @param {string} name - The new name of the role
 * @param {Array<string>} connect - An array of permission IDs to connect to the role
 * @param {Array<string>} disconnect - An array of permission IDs to disconnect from the role
 * @returns {Promise<{ data: Role }>} An object with the updated role data
*/
export const updateRolePermissions = async (
    roleId: string,
    name: string,
    connect: [],
    disconnect: []
) => {
    try {
        const permissions = {
            create: connect.filter((e) => e !== undefined && e !== null).map((elt) => {
                return {
                    permission: {
                        connect: {
                            id: elt,
                        },
                    },
                };
            }),
            deleteMany: disconnect.filter((e) => e !== undefined && e !== null).map((elt) => {
                return {
                    permissionId: elt,
                };
            }),
        };

        const updatedRole = await db.role.update({
            where: {
                id: roleId,
            },
            data: {
                name: name || undefined,
                permissions,
            },
        });
        return json(Response({
            data: updatedRole
        }), {
            status: 200
        });
    } catch (error) {
        console.log(error);
        return errorHandler(error);
    }
};
