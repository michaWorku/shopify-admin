import { Permission } from "@prisma/client"
import { db } from "~/services/db.server"
import customErr, { Response, errorHandler } from "../../../utils/handler.server"
import { json } from "@remix-run/node"


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
    } catch (err: any) {
        throw new Error(err.message)
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





