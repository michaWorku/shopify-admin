import z from 'zod'

export const status = ['ACTIVE', 'INACTIVE'] as const

/**
 * Represents a client schema.
 * @typedef {Object} ClientSchema
 * @property {string} name - The name of the client.
 * @property {string} promotionText - The promotion text of client.
 * @property {string} url - The custom url of the client.
 * @property {string} phone - The phone of the client.
 * @property {string} email - The email of the client.
 */

/**
 * The role schema object.
 * @type {z.ZodObject<ClientSchema>}
 */
export const clientSchema = z.object({
    name: z.string().trim().min(2, { message: 'Too short' }),
    promotionText: z.string().trim().min(2, { message: 'Too short' }),
    url: z.string().trim().url()?.optional(),
    phone: z
        .string({ required_error: 'Phone number is required' })
        .min(10, { message: 'Invalid number' }),
    email: z.string().trim().min(1, { message: 'Email is required' }).email(),
})

export const clientSchemaForUpdate = z.object({
    name: z.string().trim().min(2, { message: 'Too short' }).optional(),
    promotionText: z.string().trim().min(2, { message: 'Too short' }).optional(),
    url: z.string().trim().url().optional(),
    phone: z
        .string({ required_error: 'Phone number is required' })
        .min(10, { message: 'Invalid number' }).optional(),
    email: z.string().trim().min(1, { message: 'Email is required' }).email().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE','PENDING']).optional()
})

export const statusSchema = z.object({
    status: z.enum(status),
})
