import { json } from '@remix-run/node'
import { validate } from "./validators/validate";
import { Response } from './handler.server';
import { z } from 'zod';

/**
 * Parses a multipart form data and validates it against the specified schema.
 * @async
 * @function formHandler
 * @param {Request} request - The HTTP request containing the form data to parse.
 * @param {z.ZodObject} schema - The Zod schema to validate the form data against.
 * @returns {Promise<object>} - A Promise that resolves to an object containing the parsed and validated form data.
 * @throws {Error} - Throws an error if the validation fails.
 */
 export const formHandler = async (request: Request, schema: z.ZodObject<any>) => {
    const form = await request.formData();
    let formData = Object.fromEntries(form) as any;
  
    formData= JSON.parse(formData.data)
    console.dir(formData, {depth: null});
    const hasPhone = formData.hasOwnProperty('phone');

    if (hasPhone) {
        const parsedPhone = formData.phone.startsWith("+") ? formData.phone.slice(1) : formData.phone;
        const phone = `251${parsedPhone.startsWith("0")
            ? parsedPhone.slice(1)
            : parsedPhone.startsWith("251")
                ? parsedPhone.slice(3)
                : parsedPhone
            }`;
        formData = { ...formData, phone }
    }
    const { success, data, ...fieldError } = await validate(
        formData,
        schema
    );
    console.dir(fieldError, {depth: null});
    if (!success) {
        return json(
            Response({
                error: {
                    fieldError,
                    error: { message: "Validation error" },
                },
            }),
            { status: 422 }
        );
    }
    return {success,data}
}



