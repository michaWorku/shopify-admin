import { Prisma, Reward } from "@prisma/client";
import { filterFunction } from "~/utils/params/filter.server";
import getParams from "~/utils/params/getParams.server";
import { searchFunction } from "~/utils/params/search.server";
import { db } from "../db.server";
import { json } from '@remix-run/node'
import customErr, { Response, errorHandler } from "~/utils/handler.server";
import canUser, { AbilityType } from "~/utils/casl/ability";
import { canPerformAction } from "~/utils/casl/canPerformAction";

/**
 * Creates a reard with a set of reward data
 * @param {Reward} rewardData - The data of the reward to create
 * @param {string} userId - The ID of the user creating the reward
 * @param {string} clientId - The ID of the client associated with the reward
 * @returns {Promise<ResponseType>} - A promise that resolves to a response object
*/
export const createReward = async (rewardData: Reward, userId: string, clientId: string): Promise<any> => {
    try {
        const canCreate = await canUser(userId, 'create', 'Reward', {})
        if (canCreate?.status !== 200) {
            return canCreate
        }

        if (!rewardData) {
            throw new customErr("Custom_Error", "Invalid reward data!", 400);
        }

        // Create reward
        const data = await db.reward.create({
            data: {
                name: rewardData?.name,
                description: rewardData?.description,
                rewardGiven: rewardData?.rewardGiven,
                client: {
                    connect: {
                        id: clientId
                    }
                },
                createdBy: userId,
                plan: rewardData?.plan,
                form: {
                    connect: {
                        id: rewardData?.formId
                    }
                },
            }
        });

        return json(Response({
            data,
            message: 'Reward successfully created',
        }), {
            status: 201
        })
    } catch (err) {
        return errorHandler(err)
    }
}

/**
 * Retrieves all reward for the specified client based on the specified request parameters.
 * @async function getAllClientRewards
 * @param {Request} request - The HTTP request object containing the request parameters.
 * @param {string} clientId - The ID of the client associated with the rewards.
 * @returns {Promise<Response>} - The HTTP response containing the rewards and their metadata.
 * @throws {customErr} - An error indicating that no rewards were found.
 * @throws {Error} - An error indicating that an unexpected error occurred.
 */
export const getAllClientRewards = async (request: Request, clientId?: string): Promise<any> => {
    try {
        const { sortType, sortField, skip, take, pageNo, search, filter, exportType } = getParams(request);

        const searchParams = searchFunction(search, 'Reward', ['name', 'description']);
        const filterParams = filterFunction(filter, 'Reward');

        const rewardsWhere: Prisma.RewardWhereInput = {
            deletedAt: null,
            clientId,
            ...searchParams,
            ...filterParams,
        };

        const rewardsCount = await db.reward.count({ where: rewardsWhere });

        if (rewardsCount === 0) {
            throw new customErr('Custom_Error', 'No reward found', 404);
        }

        const rewards = await db.reward.findMany({
            take,
            skip,
            orderBy: [{ [sortField]: sortType }],
            where: rewardsWhere
        });

        let exportData;

        if (exportType === 'page') {
            exportData = rewards;
        } else if (exportType === 'filtered') {
            exportData = await db.reward.findMany({
                orderBy: [{ [sortField]: sortType }],
                where: rewardsWhere,
            });
        } else {
            exportData = await db.reward.findMany({});
        }

        return Response({
            data: rewards,
            metaData: {
                page: pageNo,
                pageSize: take,
                total: rewardsCount,
                sort: [sortField, sortType],
                searchVal: search,
                filter,
                exportType,
                exportData,
            },
        })
    } catch (error) {
        console.log('Error occurred loading rewards.');
        console.dir(error, { depth: null });
        return errorHandler(error);
    }
};

/**
 * Retrieves all rewards for a given client, with associated permissions and capabilities.
 *
 * @async
 * @function getRewards
 * @param {Request} request - The HTTP request object.
 * @param {string} userId - The ID of the user to retrieve rewards for.
 * @param {string} clientId - The ID of the client to retrieve rewards for.
 * @returns {Promise<Object>} An object containing the retrieved rewards with associated permissions and capabilities.
 * @throws {customErr} Throws a custom error if the user does not have permission to access the rewards, or if an error occurs while retrieving them.
 */
export const getRewards = async (request: Request, userId: string, clientId: string): Promise<Object> => {
    try {
        const canViewRewards = await canUser(userId, 'read', 'Reward', {});
        if (canViewRewards?.status !== 200) {
            const canViewRewardsPartial = await canUser(userId, 'read', 'Reward', {}, AbilityType.PARTIAL);
            if (!canViewRewardsPartial?.ok) {
                return canViewRewardsPartial;
            }
        }
        const rewards = await getAllClientRewards(request, clientId);
        if (rewards?.data) {
            await setRewardPermissions(userId, rewards.data, clientId);
        }
        return rewards;
    } catch (err) {
        return errorHandler(err);
    }
};

/**
 * Sets Reward permissions for a given client.
 *
 * @async
 * @function setRewardPermissions
 * @param {string} userId - The ID of the user to set permissions for.
 * @param {Object[]} rewards - An array of rewards to set permissions for.
 * @param {string} clientId - The ID of the client to set permissions for.
 * @returns {Promise<void>} A promise that resolves when the permissions have been set.
 * @throws {customErr} Throws a custom error if the client or user cannot be found.
 */
const setRewardPermissions = async (userId: string, rewards: any[], clientId: string): Promise<void> => {
    const promises = rewards.map(async (rewardData: any, index: number) => {
        const canEdit = await canPerformAction(userId, 'update', 'Reward', { clientId });
        const canViewUsers = await canPerformAction(userId, 'read', 'Users', { clientId });
        const canDelete = await canPerformAction(userId, 'delete', 'Reward', { clientId });
        rewards[index] = {
            ...rewardData,
            canEdit,
            canDelete,
            canViewUsers
        };
    });
    await Promise.all(promises);
};

/**
 * Updates a reward by ID
 * @async
 * @function updateRewardById
 * @param {string} rewardId - ID of the reward to update
 * @param {object} data - Updated reward data
 *  * @param {string} clientId - The ID of the client associated with the reward.
 * @param {string} userId The ID of the user updating the reward.
 * @returns {Promise<{ data: any, message: string }>} A promise that resolves to an object containing the reward and a success message.
 * @throws {Error} If no reward found with given ID
 */
export const updateRewardById = async (rewardId: string, data: any, clientId: string, userId: string): Promise<any> => {
    if (!rewardId) {
        throw new customErr('Custom_Error', 'Reward ID is required', 404)
    }

    const canUpdate = await canUser(userId, 'update', 'Reward', {
        clientId: clientId
    })
    if (canUpdate?.status !== 200) {
        return canUpdate
    }

    try {
        const updatedReward = await db.reward.update({
            where: { id: rewardId },
            data
        });

        return json(Response({
            data: updatedReward,
            message: 'Reward updated successfully'
        }), {
            status: 200
        });
    } catch (err) {
        return errorHandler(err);
    }
};

/**
 * Delete a reward
 * @async
 * @function deleteRewardById
 * @param {string} rewardId - ID of the reward to update
 * @param {string} clientId - The ID of the client associated with the reward.
 * @param {string} userId The ID of the user updating the reward.
 * @returns {Promise<{ data: any, message: string }>} A promise that resolves to an object containing the deleted reward and a success message.
 * @throws {Error} If no reward found with given ID
 */
export const deleteRewardById = async (rewardId: string, clientId: string, userId: string): Promise<any> => {
    if (!rewardId) {
        throw new customErr('Custom_Error', 'Reward ID is required', 404)
    }

    const canDelete = await canUser(userId, 'delete', 'Reward', {
        clientId
    })
    if (canDelete?.status !== 200) {
        return canDelete
    }

    try {
        const deletedReward = await db.reward.update({
            where: { id: rewardId },
            data: {
                deletedAt: new Date(),
            },
        });

        return json(Response({
            data: deletedReward,
            message: 'Reward deleted successfully'
        }), {
            status: 200
        });
    } catch (err) {
        return errorHandler(err);
    }
};

/**
 * Retrieve users of a reward.
 * @async
 * @function getRewardUsers
 * @param {string} clientId - The ID of the client.
 * @param {string} rewardId - The ID of the reward.
 * @returns {Promise<obj>} The retrieved users for a given reward.
 * @throws {Error} Throws an error if the provided client id, reward id is invalid and users are not found.
 */
export const getRewardUsers = async (request: Request, clientId: string, rewardId: string): Promise<any> => {
    if (!clientId) {
        throw new customErr('Custom_Error', 'Client ID is required', 404)
    }
    if (!rewardId) {
        throw new customErr('Custom_Error', 'Reward ID is required', 404)
    }
    try {
        const { sortType, sortField, skip, take, pageNo, search, filter, exportType } = getParams(request);

        const searchParams = searchFunction(search, 'User', ['firstName', 'middleName', 'lastName']);
        const filterParams = filterFunction(filter, 'User');

        const usersWhere: Prisma.UserWhereInput = {
            deletedAt: null,
            clients: {
                some: {
                    isRewareded: true,
                    client: {
                        id: clientId,
                        rewards: {
                            some: {
                                id: rewardId
                            }
                        }
                    }
                }
            },
            ...searchParams,
            ...filterParams,
        };

        const usersCount = await db.user.count({ where: usersWhere });

        if (usersCount === 0) {
            throw new customErr('Custom_Error', 'No user found', 404);
        }

        const users = await db.user.findMany({
            take,
            skip,
            orderBy: [{ [sortField]: sortType }],
            where: usersWhere
        });

        let exportData;

        if (exportType === 'page') {
            exportData = users;
        } else if (exportType === 'filtered') {
            exportData = await db.user.findMany({
                orderBy: [{ [sortField]: sortType }],
                where: usersWhere,
            });
        } else {
            exportData = await db.user.findMany({});
        }

        return Response({
            data: users,
            metaData: {
                page: pageNo,
                pageSize: take,
                total: usersCount,
                sort: [sortField, sortType],
                searchVal: search,
                filter,
                exportType,
                exportData,
            },
        })
    } catch (error) {
        console.log('Error occurred loading users.');
        console.dir(error, { depth: null });
        return errorHandler(error);
    }
};