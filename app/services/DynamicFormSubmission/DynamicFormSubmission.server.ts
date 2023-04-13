import { json } from "@remix-run/node";
import customErr, { Response, errorHandler } from "~/utils/handler.server";
import { db } from "../db.server";
import { DynamicFormSubmission, PLAN, Prisma, Reward, Status } from "@prisma/client";
import getParams from "~/utils/params/getParams.server";
import { searchFunction } from "~/utils/params/search.server";
import { filterFunction } from "~/utils/params/filter.server";
import { sewasewReward } from "../sewasew.server";
import { rewardUser } from "../Reward/Reward.server";

/**
 * Creates a dynamic form submission for a given reward, client, and submitted data
 * @param {string} rewardId - The ID of the reward for which the submission is being created
 * @param {string} clientId - The ID of the client who is submitting the form
 * @param {*} submitedData - The data that was submitted in the form
 * @param {string} phone - The phone number of the person who submitted the form
 * @returns {Promise<Response>} - A Promise that resolves to a Response object with the status and data of the submission
 * @throws {customErr} - Throws an error if either the reward ID or client ID are missing
 */
 export const createDynamicFormSubmission = async (rewardId: string, clientId: string, submitedData: any, phone: string) => {
    if (!rewardId) {
        throw new customErr('Custom_Error', 'Reward ID is required', 404)
    }
    if (!clientId) {
        throw new customErr('Custom_Error', 'Client ID is required', 404)
    }
    try {
        const result = await db.$transaction(async (tx) => {
            const { submit, ...selectedSubmittedData } = submitedData

            const createSubmission = await tx.dynamicFormSubmission.upsert({
                where: {
                    id: submit
                },
                create: {
                    data: selectedSubmittedData,
                    submittedBy: {
                        connectOrCreate: {
                            create: {
                                phone,
                                firstName: submitedData?.firstName,
                                middleName: submitedData?.middleName,
                                lastName: submitedData?.lastName,
                                email: submitedData?.email,
                                gender: submitedData?.gender?.toUpperCase(),
                            },
                            where: {
                                phone
                            }
                        }
                    },
                    reward: {
                        connect: {
                            id: rewardId
                        }
                    }

                },
                update: {
                    data: selectedSubmittedData
                },
                include: {
                    reward: true,
                    submittedBy: true
                }
            })

            console.log({createSubmission, clientId})

            const clientUser = await tx.clientUser.upsert({
                where: {
                    userId_clientId: {
                        clientId: clientId,
                        userId: createSubmission?.submittedById
                    }
                },
                create: {
                    user: {
                        connect: {
                            id: createSubmission?.submittedById
                        }
                    },
                    client: {
                        connect: {
                            id: clientId
                        }
                    }
                },
                update: {}
            })

            const updateReward = await tx.reward.update({
                where: {
                    id: rewardId,
                },
                data: {
                    submissions: {
                        connect: {
                            id: createSubmission?.id
                        },
                    }
                },
                select: {
                    id: true,
                    plan: true,
                    client: {
                        select: {
                            name: true,
                            id: true,
                            promotionText: true,
                            url: true
                        }
                    },
                    form:{
                        include:{
                            fields: true
                        }
                    },
                    submissions: {
                        select: {
                            id: true
                        }
                    }
                }
            })

            return {
                reward: updateReward,
                submission: createSubmission
            }
        }, {
            maxWait: 10000,
            timeout: 50000
        })


        return Response({
            data: {
                status: 'INPROGRESS',
                ...result
            },
            message: 'Submiting data in progress'
        })
    } catch (err) {
        return errorHandler(err);
    }
}


/**
 * Updates the status of a dynamic form submission
 *
 * @param {string} dynamicFormSubmissionId - The ID of the dynamic form submission to update
 * @param {Status} status - The new status for the submission
 * @returns {Promise<Response>} A Promise that resolves to a Response object containing the updated submission and a success message
 * @throws {customErr} Throws an error if the dynamicFormSubmissionId is not provided
 */
export const updateDynamicFormSubmissionStatus = async (dynamicFormSubmissionId: string, status: Status): Promise<any> => {
    if (!dynamicFormSubmissionId) {
        throw new customErr('Custom_Error', 'Dynamic form submission ID is required', 404)
    }

    try {
        const updateStatus = await db.dynamicFormSubmission.update({
            where: { id: dynamicFormSubmissionId },
            data: {
                status
            }
        });

        return Response({
            data: updateStatus,
            message: 'Submission status updated successfully'
        })
    } catch (err) {
        return errorHandler(err);
    }
};


/**
 * Retrieve all client form submissions.
 * @async
 * @function getClientSubmissions
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<obj>} The retrieved client submissions.
 * @throws {Error} Throws an error if the provided client id is invalid and submissions are not found.
 */
export const getClientSubmissions = async (request: Request, clientId: string): Promise<any> => {
    if (!clientId) {
        throw new customErr('Custom_Error', 'Client ID is required', 404)
    }
    try {
        const { sortType, sortField, skip, take, pageNo, search, filter, exportType } = getParams(request);

        const searchParams = searchFunction(search, 'DynamicFormSubmission', ['id', 'submittedById', 'status']);
        const filterParams = filterFunction(filter, 'DynamicFormSubmission');

        const submissionWhere: Prisma.DynamicFormSubmissionWhereInput = {
            deletedAt: null,
            reward: {
                client: {
                    id: clientId,
                }
            },
            ...searchParams,
            ...filterParams,
        };

        const submissionsCount = await db.dynamicFormSubmission.count({ where: submissionWhere });

        if (submissionsCount === 0) {
            throw new customErr('Custom_Error', 'No submission found', 404);
        }

        const submissions = await db.dynamicFormSubmission.findMany({
            take,
            skip,
            orderBy: [{ [sortField]: sortType }],
            where: submissionWhere,
            include: {
                reward: true,
                submittedBy: true
            }
        });

        let exportData;

        if (exportType === 'page') {
            exportData = submissions;
        } else if (exportType === 'filtered') {
            exportData = await db.user.findMany({
                orderBy: [{ [sortField]: sortType }],
                where: submissionWhere,
            });
        } else {
            exportData = await db.dynamicFormSubmission.findMany({});
        }

        return Response({
            data: submissions,
            metaData: {
                page: pageNo,
                pageSize: take,
                total: submissionsCount,
                sort: [sortField, sortType],
                searchVal: search,
                filter,
                exportType,
                exportData,
            },
        })
    } catch (error) {
        console.log('Error occurred loading client submissions.');
        console.dir(error, { depth: null });
        return errorHandler(error);
    }
};


/**
 * Retrieve a reward form submissions.
 * @async
 * @function getRewardSubmissions
 * @param {string} rewardId - The ID of the reward.
 * @returns {Promise<obj>} The retrieved reward submissions.
 * @throws {Error} Throws an error if the provided reward id is invalid and submissions are not found.
 */
export const getRewardSubmissions = async (request: Request, rewardId: string): Promise<any> => {
    if (!rewardId) {
        throw new customErr('Custom_Error', 'Reward ID is required', 404)
    }
    try {
        const { sortType, sortField, skip, take, pageNo, search, filter, exportType } = getParams(request);

        const searchParams = searchFunction(search, 'DynamicFormSubmission', ['id', 'submittedById', 'status']);
        console.log({searchParams})
        const filterParams = filterFunction(filter, 'DynamicFormSubmission');

        const submissionWhere: Prisma.DynamicFormSubmissionWhereInput = {
            deletedAt: null,
            reward: {
                id: rewardId
            },
            ...searchParams,
            ...filterParams,
        };

        const submissionsCount = await db.dynamicFormSubmission.count({ where: submissionWhere });

        if (submissionsCount === 0) {
            throw new customErr('Custom_Error', 'No submission found', 404);
        }

        const submissions = await db.dynamicFormSubmission.findMany({
            take,
            skip,
            orderBy: [{ [sortField]: sortType }],
            where: submissionWhere,
            include: {
                reward: true,
                submittedBy: true
            }
        });

        let exportData;

        if (exportType === 'page') {
            exportData = submissions;
        } else if (exportType === 'filtered') {
            exportData = await db.user.findMany({
                orderBy: [{ [sortField]: sortType }],
                where: submissionWhere,
            });
        } else {
            exportData = await db.dynamicFormSubmission.findMany({});
        }

        return Response({
            data: submissions,
            metaData: {
                page: pageNo,
                pageSize: take,
                total: submissionsCount,
                sort: [sortField, sortType],
                searchVal: search,
                filter,
                exportType,
                exportData,
            },
        })
    } catch (error) {
        console.log('Error occurred loading client submissions.');
        console.dir(error, { depth: null });
        return errorHandler(error);
    }
};

/**
 * Handles dynamic form submission.
 * create or update dynamic form submission
 * reward user via sewasew 
 * update user reward and submission
 * @param {string} rewardId - The ID of the reward.
 * @param {string} clientId - The ID of the client.
 * @param {*} submittedData - The data submitted.
 * @param {string} phone - The phone number of the submitter.
 * @returns {*} The result of the reward or submission.
*/
export const handleDynamicFormSubmission = async (rewardId: string, clientId: string, submitedData: any, phone: string) => {
    try {
        // create dynamic form submission
        const submission = await createDynamicFormSubmission(rewardId, clientId, submitedData, phone)
        console.log({submission})
        if (submission?.data?.status === 'INPROGRESS' && !!submission?.data?.reward && !!submission.data?.submission) {
            // sewasew reward
            const sewasewRewardResp = await sewasewReward({
                client_id: submission?.data?.reward?.client.id,
                client_name: submission?.data?.reward?.client.name,
                phone,
                reward_id: submission?.data?.reward?.id,
                subscription_plan: submission?.data?.reward?.plan
            })
            console.log({sewasewRewardResp})
            // reward user
            if (sewasewRewardResp?.status === 200 && !!sewasewRewardResp?.data?.ok) {
                const reward = await rewardUser(submission?.data?.reward, submission?.data?.submission)
                console.log({userReward: reward})
                return reward
            } else if (sewasewRewardResp?.status === 409) {
                if (sewasewRewardResp?.message?.includes('subscription')) {
                    return json(Response({
                        error: {
                            error: {
                                message: sewasewRewardResp?.message
                            }
                        },
                        data: {
                            subscription: 'ACTIVE'
                        }
                    }))
                }
                return json(Response({
                    error: {
                        error: {
                            message: sewasewRewardResp?.message
                        }
                    },
                    data: {
                        rewareded: true
                    }
                }))
            }

            return json(Response({
                error: {
                    error: {
                        message: sewasewRewardResp?.message
                    }
                },
                data: {
                    submissionId: submission?.data?.id,
                    submitedData,
                    submit: true,
                    data:{
                        ...submission?.data?.reward
                    }
                }
            }))

        }
        return submission
    } catch (error) {
        return errorHandler(error);
    }
}
