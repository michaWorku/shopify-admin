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
 * @function
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
 * Retrieves a role from the database based on a scalar field.
 * @async
 * @function
 * @param {string} fieldName - The name of the scalar field to search for (e.g. "name").
 * @param {any} fieldValue - The value of the scalar field to search for (e.g. "admin").
 * @returns {Promise<object>} The retrieved role object.
 * @throws {Error} Throws an error if there's an issue retrieving the role.
 */
export const getRoleByScalarField = async (fieldName: string, fieldValue: string) => {
    const validScalarFields = ['id', 'name', 'description', 'createdBy', 'status'];

    try {
        if (!validScalarFields.includes(fieldName)) {
            throw new customErr('Custom_Error', `Invalid field name provided`, 400);
        }

        const role = await db.role.findUnique({
            where: {
                [fieldName]: fieldValue,
            },
            include: {
                users:{
                    include:{
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
 * 
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
        if(!!roleCount){
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
                metaData : {
                    page: pageNo,
                    pageSize: take,
                    sort: [sortField, sortType],
                    searchVal: search,
                    filter,
                    total: roleCount,
                }
            }
            
        }
        throw new customErr('Custom_Error','Role not found', 404)
    } catch (error: any) {
        throw Error(error)
    }
}