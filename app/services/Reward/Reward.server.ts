import { DynamicFormSubmission, PLAN, Prisma, Reward } from "@prisma/client";
import { filterFunction } from "~/utils/params/filter.server";
import getParams from "~/utils/params/getParams.server";
import { searchFunction } from "~/utils/params/search.server";
import { db } from "../db.server";
import { json } from '@remix-run/node'
import customErr, { Response, ResponseType, badRequest, errorHandler } from "~/utils/handler.server";
import canUser, { AbilityType } from "~/utils/casl/ability";
import { canPerformAction } from "~/utils/casl/canPerformAction";
import { commitSession, getSession } from "../session.server";
import { createOTP } from "../otp.server";

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
        const canViewSubmissions = await canPerformAction(userId, 'read', 'DynamicFormSubmission', { clientId });
        const canDelete = await canPerformAction(userId, 'delete', 'Reward', { clientId });
        rewards[index] = {
            ...rewardData,
            canEdit,
            canDelete,
            canViewUsers,
            canViewSubmissions
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
                    isRewarded: true,
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

/**
 * Retrieves a reward by its ID.
 * @async
 * @function getReward
 * @param {string} rewardId - The ID of the reward to retrieve.
 * @returns {Promise<object>} The reward object.
 * @throws {customErr} If the reward ID is not provided or no reward is found with the given ID.
 */
export const getReward = async (rewardId: string): Promise<any> => {
    try {
        if (!rewardId) {
            throw new customErr('Custom_Error', 'Reward ID is required', 404);
        }

        const reward = await db.reward.findUnique({
            where: {
                id: rewardId,
            },
            include: {
                form: {
                    include: {
                        fields: true
                    }
                },
                client: true,
                users: true,
            },
        });

        if (!reward) {
            throw new customErr('Custom_Error', `Reward not found with ID ${rewardId}`, 404);
        }

        return Response({
            data: reward,
        })
    } catch (error) {
        return errorHandler(error);
    }
};

/**
 * Verifies if the user is eligible for the given reward based on the rewardId, clientId, and phone.
 * If the reward is already completed, the error message will be returned.
 * If the user is already rewarded, the response will contain a message that the user already received the reward.
 * If the users is verifided and is not rewarded, the response will contain reward information
 * If the user is eligible, an OTP will be generated and returned with the response.
 * @param {Request} request - The request object.
 * @param {string} rewardId - The id of the reward to be verified.
 * @param {string} clientId - The id of the client associated with the reward.
 * @param {string} phone - The phone number of the user.
 * @returns {Promise<Response>} The response containing the data of the user's eligibility or the generated OTP.
 * @throws {customErr} When the rewardId or clientId is missing.
 * @throws {error} When there's an error while processing the request.
*/
export const verifyUser = async (request: Request, rewardId: string, clientId: string, phone: string) => {
    if (!rewardId) {
        throw new customErr('Custom_Error', 'Reward ID is required', 404)
    }
    if (!clientId) {
        throw new customErr('Custom_Error', 'Client ID is required', 404)
    }
    try {
        const session = await getSession(request.headers.get("Cookie"));

        const reward = await db.reward.findUnique({
            where: {
                id: rewardId,
            },
        });
        if (reward?.rewardGiven === reward?.rewardTaken) {
            // Reward is completed
            return json(Response({
                error: {
                    error: {
                        message: "Reward completed"
                    }
                },
                data: {
                    completed: true
                }
            }), {
                status: 400
            });
        } else {

            const checkUserVerifed = await db.user.count({
                where: {
                    phone,
                    isVerified: {
                        equals: true
                    }
                }
            })

            const checkRewarded = await db.reward.count({
                where: {
                    clientId,
                    users: {
                        some: {
                            rewardId,
                            users: {
                                phone
                            }
                        }
                    },
                }
            })

            console.log({ checkRewarded })

            if (checkRewarded > 0) {
                return json(Response({
                    error: { error: { message: 'User has already got a reward' } },
                    data: { rewarded: true },
                }), {
                    status: 400
                });
            } else {
                if (checkUserVerifed > 0) {
                    const reward = (await getReward(rewardId)) as any;

                    console.dir({ reward: reward?.data });

                    if (reward?.status === 404) {
                        return json(
                            Response({
                                error: {
                                    error: {
                                        message: "No reward found",
                                    },
                                },
                            })
                        );
                    }

                    return json(
                        Response({
                            data: {
                                ...reward,
                                submit: true
                            },
                        })
                    );
                }
                const fullHash = await createOTP(phone);
                console.log({ phone, fullHash });

                if (!!fullHash?.data) {
                    session.set("hash", fullHash?.data?.fullHash);
                    return json<ResponseType>(
                        { data: { phone: fullHash?.data?.phone, sendOTP: true } },
                        {
                            headers: {
                                "Set-Cookie": await commitSession(session),
                            },
                        }
                    );
                }
                return badRequest({ ...fullHash });
            }
        }

    } catch (error) {
        return errorHandler(error);
    }
}

/**
 * Checks if a reward can be given to a user
 * @param {string} rewardId - The ID of the reward being checked
 * @param {string} clientId - The ID of the client
 * @param {string} phone - The user's phone number
 * @returns {Promise<Object>} - Returns a promise that resolves to an object containing either an error message or reward data
 * @throws {CustomError} - Throws a custom error if rewardId or clientId are falsy
 */
export const checkReward = async (rewardId: string, clientId: string, phone: string) => {
    if (!rewardId) {
        throw new customErr('Custom_Error', 'Reward ID is required', 404);
    }

    if (!clientId) {
        throw new customErr('Custom_Error', 'Client ID is required', 404);
    }

    try {
        // Find the reward in the database
        const reward = await db.reward.findUnique({
            where: { id: rewardId }, include: {
                client: {
                    select: {
                        name: true,
                        promotionText: true,
                    }
                }
            }
        });

        // Check if the reward has already been completed
        if (reward?.rewardGiven === reward?.rewardTaken) {
            return json(Response({
                error: { error: { message: "Reward completed" } },
                data: {
                    completed: true, plan: reward?.plan,
                    client: reward?.client
                }
            }), { status: 400 });
        }

        // Check if the user has already been rewarded
        const rewardedCount = await db.reward.count({
            where: {
                clientId,
                users: {
                    some: {
                        rewardId,
                        users: { phone },
                        // AND:{
                        //     rewardId,
                        //     users:{
                        //         phone
                        //     }
                        // }
                    }
                }
            }
        });

        console.log({ rewardedCount, rewardId, phone })

        if (rewardedCount > 0) {
            return json(Response({
                error: { error: { message: 'User has already got a reward' } },
                data: {
                    rewarded: true,
                    plan: reward?.plan,
                    client: reward?.client
                },
            }), { status: 400 });
        }

        // Retrieve the reward data
        const rewardData = (await getReward(rewardId))?.data;

        if (!rewardData) {
            return json(Response({
                error: { error: { message: "No reward found" } }
            }));
        }

        // Return the reward data
        return json(Response({
            data: { ...rewardData }
        }));

    } catch (error) {
        // Handle any errors thrown during execution
        return errorHandler(error);
    }
};

interface RewardInteface {
    client: {
        id: string;
        name: string;
    };
    id: string;
    plan: PLAN;
    submissions: {
        id: string;
    }[];
}
type Submission = DynamicFormSubmission & {
    reward: Reward;
    submittedBy: {
        id: string;
    };
}

/**
 * Rewards a user for submitting a dynamic form
 * @param {Object} rewardData - The reward data to update
 * @param {Object} submissionData - The submission data to update
 * @param {*} submittedData - The data submitted.
 * @returns {Promise<Object>} Returns a JSON response with the rewarded user data
 * @throws {Error} Throws an error if the reward or submission data is missing
 */
export const rewardUser = async (rewardData: RewardInteface, submissionData: Submission, submitedData: any) => {
    if (!rewardData) {
        throw new customErr('Custom_Error', 'Reward is required', 404)
    }
    if (!submissionData) {
        throw new customErr('Custom_Error', 'Submissions is required', 404)
    }
    try {
        const result = await db.$transaction(async (tx) => {
            const userReward = await tx.userReward.upsert({
                where: {
                    userId_rewardId: {
                        userId: submissionData?.submittedBy?.id,
                        rewardId: rewardData?.id
                    }
                },
                create: {
                    userId: submissionData?.submittedBy?.id,
                    rewardId: rewardData?.id

                },
                update: {
                }
            })
            const rewardUser = await tx.clientUser.update({
                where: {
                    userId_clientId: {
                        userId: "submissionData?.submittedBy?.id",
                        clientId: rewardData?.client?.id
                    }
                },
                data: {
                    isRewarded: true,
                    client: {
                        update: {
                            rewards: {
                                update: {
                                    where: {
                                        id: rewardData?.id
                                    },
                                    data: {
                                        rewardTaken: {
                                            increment: 1,
                                        },
                                        submissions: {
                                            update: {
                                                where: {
                                                    id: submissionData?.id
                                                },
                                                data: {
                                                    status: "ACTIVE"
                                                }
                                            }
                                        },

                                    }
                                },

                            }
                        }
                    }
                },
                select: {
                    isRewarded: true,
                    client: {
                        select: {
                            name: true,
                        }
                    }
                }
            })
            return {
                rewarded: rewardUser?.isRewarded,
                reward: rewardData,
                submission: submissionData
            }
        }, {
            maxWait: 10000,
            timeout: 50000
        })


        return json(Response({
            data: {
                ...result
            },
            message: 'User rewarded'
        }), {
            status: 200
        });

    } catch (err) {
        return json(Response({
            error: {
                error: {
                    message: "Failed to reward a user, Please try again"
                }
            },
            data: {
                submitedData,
                retry: true
            }
        }))
    }
}