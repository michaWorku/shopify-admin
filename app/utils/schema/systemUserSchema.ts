import z from "zod";

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
export const StatusValue = ["ACTIVE", "INACTIVE"] as const;
export const GenderValue = ["MALE", "FEMALE"] as const;

export const dateSchema = z
  .preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date())
  .optional();

export const systemUserSchema = z.object({
  firstName: z.string().trim().min(2, { message: "Too short" }),
  middleName: z.string().trim().min(2, { message: "Too short" }).optional(),
  lastName: z.string().trim().min(2, { message: "Too short" }),
  phone: z
    .string({ required_error: "Phone number is required" })
    .min(10, { message: "Invalid number" }),
  birthDate: dateSchema,
  gender: z.enum(GenderValue),
  password: z.string().trim().min(4, { message: "Too short" }),
  roleId: z
    .string({ required_error: "Role is required" })
    .uuid({ message: "Role is required" })
    .array(),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email()
    .optional(),
});

export const updateSystemUserSchema = z.object({
  firstName: z.string().trim().min(2, { message: "Too short" }).optional(),
  middleName: z.string().trim().min(2, { message: "Too short" }).optional(),
  lastName: z.string().trim().min(2, { message: "Too short" }).optional(),
  phone: z
    .string({ required_error: "Phone number is required" })
    .min(10, { message: "Invalid number" })
    .optional(),
  birthDate: dateSchema,
  password: z.string().trim().min(4, { message: "Too short" }).optional(),
  roleId: z
    .string({ required_error: "Role is required" })
    .uuid({ message: "Role is required" })
    .array()
    .optional(),
  gender: z.enum(GenderValue).optional(),
  email: z

    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email()
    .optional(),
  status: z.enum(StatusValue).optional(),
});
