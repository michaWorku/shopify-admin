import { json } from '@remix-run/node'
import { db } from '../db.server'
import customErr, { Response, errorHandler } from '~/utils/handler.server'
import { Client, Permission, Role, RolePermission } from '@prisma/client'
import getParams from '~/utils/params/getParams.server'
import { searchCombinedColumn } from '~/utils/params/search.server'
import { filterFunction } from '~/utils/params/filter.server'
import canUser from '~/utils/casl/ability'
import { checkUserPermissions, getAllPermissions } from './Permissions/permission.server'

export interface EntityPermission {
    [key: string]: {
        [key: string]: any;
        permissions: Permission[];
    }[];
}

/**
 * Creates a new role for a user
 *
 * @async
 * @function createRole
 * @param {string} userId - The user ID
 * @param {object} roleData - The role data
 * @param {string} roleData.name - The name of the role
 * @param {string[]} roleData.permissions - An array of permission IDs
 * @returns {object} - The created role
 * @throws {CustomError} If user ID is missing or role data is missing or invalid
 */
export const createRole = async (userId: string, roleData: any) => {
    try {
        // Check user ID and role data
        if (!userId) {
            throw new customErr('Custom_Error', 'User ID is required', 404)
        }

        if (!roleData || !roleData.name || !roleData.permissions) {
            throw new customErr('Custom_Error', 'Role data is missing or invalid', 404)
        }

        // Check user's permissions
        const canCreateRole = await checkUserPermissions(userId, roleData.permissions)
        if (!canCreateRole) {
            return json(
                Response({
                    error: {
                        error: {
                            message:
                                'You are not authorized to create a role',
                        },
                    },
                }),
                { status: 403 }
            )
        }

        // Create role
        const createdRole = await db.role.create({
            data: {
                name: roleData.name,
                createdBy: userId,
                permissions: {
                    create: roleData.permissions.map((permissionId: string) => {
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
            throw new customErr('Custom_Error', `Role not found with ID: ${roleId}`, 404)
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
    connect: string[],
    disconnect: string[]
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

/**
 * Edits a role by updating its name and permissions.
 *
 * @async
 * @function editRole
 * @param {string} userId - The ID of the user performing the action.
 * @param {string} roleId - The ID of the role to edit.
 * @param {object} data - An object containing the new permissions.
 * @param {string} name - The new name of the role.
 * @returns {object} A JSON response with the updated role.
 * @throws {CustomError} If user ID or role ID is missing, or if the user is not authorized to edit the role.
 */
export const editRole = async (userId: string, roleId: string, data: any, name: string) => {
    try {
        if (!userId) {
            throw new customErr('Custom_Error', 'User ID is required', 404)
        }

        if (!roleId) {
            throw new customErr('Custom_Error', 'Role ID is required', 404)
        }

        const { rolePermissions } = await getRolePermissions(userId, roleId)

        const { connect, disconnect } = permissionChange(rolePermissions, data)

        const updatedRole = await updateRolePermissions(roleId, name, connect, disconnect)

        return json(Response({ data: updatedRole }), { status: 200, statusText: 'OK' })
    } catch (err) {
        return errorHandler(err)
    }
}

/**
* Compares the old and new permissions and returns an object with the permissions to connect and disconnect.
*
* @function permissionChange
* @param {Permission[]} oldPermissions - An array of the old permissions.
* @param {string[]} newPermissions - An array of the new permissions.
* @returns {object} An object with the permissions to connect and disconnect.
*/
export const permissionChange = (oldPermissions: any[], newPermissions: string[]) => {
    const oldPermissionIds = oldPermissions.map(permission => permission.id)

    const disconnect = oldPermissionIds.filter(id => !newPermissions.includes(id))

    const connect = newPermissions.filter(id => !oldPermissionIds.includes(id))

    return { connect, disconnect }
}

/**
 * Retrieve the role permissions for a given user and role.
 *
 * @async
 * @function getRolePermissions
 * @param {string} userId - The ID of the user.
 * @param {string} roleId - The ID of the role.
 * @returns {Promise<{role: object, rolePermissions: Permission[]}>} An object containing the role and an array of permissions that the user has for that role.
 * @throws {Error} If the role or permissions cannot be retrieved.
 */
export async function getRolePermissions(userId: string, roleId: string) {
    try {
        const role = await getRoleById(roleId)
        const userAllPermissions = await allUserPermissions(userId)
        const rolePermissionIds = role.permissions.map((p: any) => p.permission.id)
        const rolePermissions = userAllPermissions.filter((p: any) => rolePermissionIds.includes(p.id))
        return { role, rolePermissions }
    } catch (err) {
        return errorHandler(err)
    }
}

/**
 * Retrieves all permissions of a user by user ID.
 *
 * @async
 * @function allUserPermissions
 * @param {string} userId - The ID of the user to retrieve permissions for.
 *
 * @returns {Promise<Permission[]>} An array of permissions.
 * @throws {Error} If an error occurs while retrieving the permissions.
 */
export const allUserPermissions = async (userId: string): Promise<Permission[]> => {
    try {
        const userRoles = await getUserRoles(userId)
        const rolePermissions: Set<string> = new Set()
        const permissions: Permission[] = []

        for (const role of userRoles) {
            for (const permission of role.permissions) {
                const permissionId = permission.permission.id
                if (permission.permission.action === 'manage' && permission.permission.subject === 'all') {
                    const { data } = await getAllPermissions()
                    permissions.push(...data)
                    break
                } else if (!rolePermissions.has(permissionId)) {
                    rolePermissions.add(permissionId)
                    permissions.push(permission.permission)
                }
            }
        }

        return permissions
    } catch (err) {
        throw errorHandler(err)
    }
}

/**
 * Removes permissions from selected permission list based on the specified entity and its values.
 *
 * @param state - The entity permission state.
 * @param selectedPermission - The list of selected permissions to remove from.
 * @param value - The entity values to use to determine which permissions to remove.
 * @param name - The name of the entity.
 * @returns An object containing the new permission list and the original entity permission state.
 */
export const removePermissions = (
    state: EntityPermission,
    selectedPermission: Permission[],
    value: any[],
    name: string
): { newPermission: Permission[], state: EntityPermission } => {
    // Map entity name to its identifier property name
    const entityMap: { [key: string]: { id: string } } = {
        client: { id: 'client.id' },
    };

    // Create a set of selected entity identifiers to efficiently check against
    const selectedIds = new Set(value.map((e) => e[entityMap[name].id]));

    // Filter out permissions that do not match the selected entity identifiers or its entities' permissions
    const newPermission = selectedPermission.filter((permission) => {
        for (const entity of state[name + 's']) {
            if (entity !== undefined) {
                if (selectedIds.has(entity[entityMap[name].id])) {
                    return true;
                }
                if (entity?.permissions.some((p: any) => p.id === permission.id)) {
                    return true;
                }
            }
        }
        return false;
    });

    return { newPermission, state };
};

