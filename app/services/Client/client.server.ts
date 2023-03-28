import { Client, Permission } from "@prisma/client"
import canUser from "~/utils/casl/ability"
import { Response, ResponseType, errorHandler } from "~/utils/handler.server"
import { db } from "../db.server"
import clientPermissions from "~/utils/permissionRepo/clientPermissions"
import interpolate from "~/utils/casl/interpolate"

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
