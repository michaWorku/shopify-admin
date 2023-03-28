import * as z from 'zod';

/**
 * Represents a role schema.
 * @typedef {Object} RoleSchema
 * @property {string} name - The name of the role.
 * @property {Array<string>} permissions - The permissions associated with the role.
 */

/**
 * The role schema object.
 * @type {z.ZodObject<RoleSchema>}
 */
export const roleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Role name is required' })
    .min(3, { message: 'Role name is too short' }),
  permissions: z.array(z.string().trim().uuid()),
});
