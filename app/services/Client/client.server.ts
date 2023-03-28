import { Client, Permission } from "@prisma/client"
import canUser from "~/utils/casl/ability"
import customErr, { Response, ResponseType, errorHandler } from "~/utils/handler.server"
import { db } from "../db.server"
import clientPermissions from "~/utils/permissionRepo/clientPermissions"
import interpolate from "~/utils/casl/interpolate"
import getParams from "~/utils/params/getParams.server"
import { filterFunction } from "~/utils/params/filter.server"
import { searchFunction } from "~/utils/params/search.server"

/**
 * Creates a new client with the provided data.
 * @async function createClient
 * @param {Client} clientData The data of the new client.
 * @param {string} userId The ID of the user creating the client.
 * @returns {Promise<Response>} A Promise that resolves to a Response object containing the newly created client.
 */
export const createClient = async (clientData: Client, userId: string): Promise<ResponseType> => {
    try {
        const canCreate = await canUser(userId, 'create', 'Client', {})
        if (canCreate?.status !== 200) {
            return canCreate
        }

        const result = await db.$transaction(
            async (tx) => {
                const newClient = await tx.client.create({
                    data: clientData,
                })

                const clientId = newClient?.id
                const clientPermission = clientPermissions()
                const parsedPermissions = interpolate(
                    JSON.stringify(clientPermission),
                    {
                        clientId,
                    }
                )

                await tx.role.create({
                    data: {
                        name: `${newClient?.name}`,
                        permissions: {
                            create: parsedPermissions.map((item: Partial<Permission>) => {
                                return {
                                    permission: {
                                        create: item,
                                    },
                                }
                            }),
                        },
                        createdBy: userId,
                    },
                })
                return { newClient }
            },
            {
                maxWait: 5000,
                timeout: 30000,
            }
        )

        return Response({
            data: result.newClient,
        })
    } catch (err) {
        return errorHandler(err)
    }
}


/**
 * Retrieves all clients based on the specified request parameters.
 * @async function getAllClients
 * @param {Request} request - The HTTP request object containing the request parameters.
 * @param {string} [userId] - The ID of the user, if any, that is associated with the clients.
 * @returns {Promise<Response>} - The HTTP response containing the clients and their metadata.
 * @throws {customErr} - An error indicating that no clients were found.
 * @throws {Error} - An error indicating that an unexpected error occurred.
 */
export const getAllClients = async (request: Request, userId?: string): Promise<ResponseType> => {
    try {
        const {
            sortType,
            sortField,
            skip,
            take,
            pageNo,
            search,
            filter,
            exportType,
        } = getParams(request);

        const searchParams = searchFunction(search, 'Client', ['name', 'phone']); // Adjust the search columns as necessary.
        const filterParams = filterFunction(filter, 'Client');

        let _where: any = {
            deletedAt: null,
            ...(userId
                ? {
                    users: {
                        some: {
                            id: userId
                        }
                    },
                }
                : {}),
            ...searchParams,
            ...filterParams,
        };

        const clientsCount = await db.client.count({
            where: _where,
        });

        if (clientsCount > 0) {
            const clients = await db.client.findMany({
                take,
                skip,
                orderBy: [
                    {
                        [sortField]: sortType,
                    },
                ],
                where: _where,
            });

            let exportData;

            if (exportType === 'page') {
                exportData = clients;
            } else if (exportType === 'filtered') {
                exportData = await db.client.findMany({
                    orderBy: [
                        {
                            ...(sortField !== 'name'
                                ? { [sortField]: sortType }
                                : {
                                    name: sortType,
                                }),
                        },
                    ],
                    where: _where,
                });
            } else {
                exportData = await db.client.findMany({});
            }

            return Response({
                data: clients,
                metaData: {
                    page: pageNo,
                    pageSize: take,
                    total: clientsCount,
                    sort: [sortField, sortType],
                    searchVal: search,
                    filter,
                    exportType,
                    exportData
                },
            });
        }

        throw new customErr('Custom_Error', 'No clients found', 404);
    } catch (error) {
        return errorHandler(error);
    }
};

