import { Client, Permission } from "@prisma/client"
import { json } from '@remix-run/node'
import canUser, { AbilityType } from "~/utils/casl/ability"
import customErr, { Response, ResponseType, errorHandler } from "~/utils/handler.server"
import { db } from "../db.server"
import clientPermissions from "~/utils/permissionRepo/clientPermissions"
import interpolate from "~/utils/casl/interpolate"
import getParams from "~/utils/params/getParams.server"
import { filterFunction } from "~/utils/params/filter.server"
import { searchFunction } from "~/utils/params/search.server"
import { checkEntityExist } from "../Entities/entity.server"
import { canViewUser } from "~/utils/casl/canViewUser"

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


/**
 * Updates a client by ID
 * @async
 * @function updatedClientById
 * @param {string} clientId - ID of the client to update
 * @param {object} data - Updated client data
 * @param {string} userId The ID of the user creating the client.
 * @returns {Promise<object>} Updated client object
 * @throws {Error} If no client found with given ID
 */
export const updateclientById = async (clientId: string, data: any, userId: string): Promise<any> => {
    if (!clientId) {
        throw new customErr('Custom_Error', 'Client ID is required', 404)
    }

    const canUpdate = await canUser(userId, 'update', 'Client', {
        clientId: clientId,
    })
    if (canUpdate?.status !== 200) {
        return canUpdate
    }

    try {
        const updatedCclient = await db.client.update({
            where: { id: clientId },
            data
        });

        return json(Response({
            data: updatedCclient
        }), {
            status: 200
        });
    } catch (err) {
        return errorHandler(err);
    }
};

/**
 * Get a client by unique field.
 * @async
 * @function getClientByField
 * @param {string} clientId - The ID of the client to get.
 * @param {string} fieldName - The name of the scalar field to search for (e.g. "id", "phone").
 * @param {string} fieldValue - The value of the scalar field to search for (e.g. "197oiaeuio9187", "251900000000").
 * @returns {Promise<object>} The client object.
 * @throws {Error} If no client is found with the given ID.
 */
export const getClientByField = async (clientId: string, fieldName: string, fieldValue: string): Promise<any> => {
    try {
        if (!clientId) {
            throw new customErr('Custom_Error', 'Client ID is required', 404);
        }

        const client = await db.role.findUnique({
            where: {
                [fieldName]: fieldValue,
            },
        });

        if (!client) {
            throw new customErr('Custom_Error', `Client not found with ${fieldValue}`, 404);
        }

        return json(Response({
            data: client,
        }), {
            status: 200,
        });
    } catch (error) {
        return errorHandler(error);
    }
};


/**
* Deletes a client with the given ID.
* @async
* @function deleteClient
* @param {string} clientId - The ID of the client to delete.
* @param {string} userId The ID of the user creating the client.
* @returns {Promise<object>} The deleted client object.
* @throws {Error} If no client is found with the given ID.
*/
export const deleteClient = async (clientId: string, userId: string): Promise<any> => {
    try {
        if (!clientId) {
            throw new customErr('Custom_Error', 'Client ID is required', 404)
        }
        
        const canDelete = await canUser(userId, 'delete', 'Client', {
            clientId: clientId,
        })
        if (canDelete?.status !== 200) {
            return canDelete
        }

        const client = await db.client.update({
            where: {
                id: String(clientId),
            },
            data: {
                deletedAt: new Date(),
            },
        })

        return json(Response({
            data: client,
        }), {
            status: 200,
        });
    } catch (error) {
        return errorHandler(error)
    }
}
/**
 * Sets client permissions for a given user.
 *
 * @async
 * @function setClientPermissions
 * @param {string} userId - The ID of the user to set permissions for.
 * @param {string} clientId - The ID of the client to set permissions for.
 * @param {Object} permissions - An object containing the permissions to set.
 * @returns {Promise<Object>} An object containing the updated client permissions.
 * @throws {customErr} Throws a custom error if the client or user cannot be found.
 */
const setClientPermissions = async (userId: string, clients: any[]):Promise<any> =>{
  const promises = clients.map(async (clientData: any, index: number) => {
    const canEdit = await canUser(userId, 'update', 'Client', {
      clientId: clientData.id,
    }).then((data) => data?.ok)

    const canViewUsers = await canViewUser(userId, {
      clientId: clientData.id,
    })

    const canDelete = await canUser(userId, 'delete', 'Client', {
      clientId: clientData.id,
    }).then((data) => data?.ok)


    clients[index] = {
      ...clientData,
      canEdit,
      canViewUsers,
      canDelete,
    }
  })

  await Promise.all(promises)
}

/**
 * Retrieves all clients for a given user, with associated permissions and capabilities.
 *
 * @async
 * @function getClients
 * @param {Request} request - The HTTP request object.
 * @param {string} userId - The ID of the user to retrieve clients for.
 * @returns {Promise<Object>} An object containing the retrieved clients with associated permissions and capabilities.
 * @throws {customErr} Throws a custom error if the user does not have permission to access the clients, or if an error occurs while retrieving the clients.
 */
export const getClients = async (request: Request, userId: string):Promise<Object> => {
  try {
    const canView = await canUser(userId, 'read', 'Client', {})

    if (canView?.status === 200) {
      const clients = await getAllClients(request)

      if (clients?.data) {
        await setClientPermissions(userId, clients.data)
      }

      return clients
      
    } else {
      const canViewPartial = await canUser(
        userId,
        'read',
        'Client',
        {},
        AbilityType.PARTIAL
      )

      if (canViewPartial?.ok) {
        const clients = (await getAllClients(request, userId)) as any

        if (clients?.data) {
          await setClientPermissions(userId, clients.data)
        }

        return clients
      } else {
        return canViewPartial
      }
    }
  } catch (err) {
    return errorHandler(err)
  }
}
