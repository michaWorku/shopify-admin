import { PLAN, Status } from "@prisma/client";
import { z } from "zod";

/**
 * Define the schema for a reward
 * @typedef {Object} Rewardchema
 * @property {string} name - The name of the reward.
 * @property {string} description - The description of the reward.
 * @property {string} formId - The id of the form.
 * @property {PLAN} plan - The plan of the reward.
 * @property {number} rewardGiven - The number of reward given.
 * @property {any} defaultValue - The default value of the reward.
*/
export const rewardSchema = z.object({
    name: z.string().trim().min(2, { message: "Too short" }),
    formId: z.string().trim().min(2, { message: "Too short" }),
    description: z.string().trim().min(2, { message: "Too short" }),
    plan: z.nativeEnum(PLAN),
    rewardGiven: z.number()
});

export const updateRewardSchema = z.object({
    name: z.string().trim().min(2, { message: "Too short" }).optional(),
    formId: z.string().trim().min(2, { message: "Too short" }).optional(),
    description: z.string().trim().min(2, { message: "Too short" }).optional(),
    plan: z.nativeEnum(PLAN).optional(),
    rewardGiven: z.number().optional(),
    status: z.nativeEnum(Status).optional(),
});