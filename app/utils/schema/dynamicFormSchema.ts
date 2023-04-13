import { DynamicFormFieldType } from "@prisma/client";
import { z } from "zod";

/**
 * Define the schema for a dynamic form field
 * @typedef {Object} DynamicFormFieldSchema
 * @property {string} name - The name of the dynamic form field.
 * @property {string} label - The label of the dynamic form field.
 * @property {DynamicFormFieldType} type - The type of the dynamic form field.
 * @property {string} description - The description of the dynamic form field.
 * @property {string} placeholder - The placeholder of the dynamic form field.
 * @property {number} order - The order of the dynamic form field.
 * @property {boolean} required - Indicates if the dynamic form field is required or not.
 * @property {any} defaultValue - The default value of the dynamic form field.
*/
export const dynamicFormFieldSchema = z.object({
    id: z.string().optional(),
    name: z.string().trim().min(2, { message: "Too short" }),
    label: z.string().trim().min(2, { message: "Too short" }),
    type: z.nativeEnum(DynamicFormFieldType),
    description: z.string().trim().min(2, { message: "Too short" }),
    placeholder: z.string().trim().min(2, { message: "Too short" }),
    order: z.number(),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
    defaultValue: z.any().optional(),
});

export const updateDynamicFormFieldSchema = z.object({
    id: z.string().optional(),
    name: z.string().trim().min(2, { message: "Too short" }).optional(),
    label: z.string().trim().min(2, { message: "Too short" }).optional(),
    type: z.enum([
        "TEXT",
        "NUMBER",
        "EMAIL",
        "PHONE",
        "SELECT",
        "CHECKBOX",
        "RADIO",
        "TEXTAREA",
        "DATE",
      ]).optional(),
    description: z.string().trim().min(2, { message: "Too short" }).optional(),
    placeholder: z.string().trim().min(2, { message: "Too short" }).optional(),
    options: z.array(z.string()).optional(),
    order: z.number().optional(),
    required: z.boolean().optional(),
    defaultValue: z.any().optional(),
});
/**
 * Define the schema for a dynamic form
 * @typedef {Object} DynamicFormSchema
 * @property {string} name - The name of the dynamic form.
 * @property {string} [description] - The description of the dynamic form (optional).
 * @property {Array<DynamicFormFieldSchema>} fields - The array of dynamic form fields.
*/
export const dynamicFormSchema = z.object({
    name: z.string().trim().min(2, { message: "Too short" }),
    description: z.string().optional(),
    fields: z.array(dynamicFormFieldSchema),
});

export const updateDynamicFormSchema = z.object({
    name: z.string().trim().min(2, { message: "Too short" }),
    description: z.string().optional(),
    fields: z.array(updateDynamicFormFieldSchema),
});