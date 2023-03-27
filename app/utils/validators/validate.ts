import * as z from 'zod'

/**
 * Validates a field against a Zod schema
 * @async function validate
 * @param field The field to validate
 * @param schema The Zod schema to use for validation
 * @returns An object containing the validation result
*/
export const validate = async (field: unknown, schema: z.ZodType<any>) => {
    try {
        const data = schema.parse(field)
        return { success: true, data }
    } catch (error: any) {
        const fieldErrors = error?.flatten().fieldErrors
        const formated = error?.format()
        return { success: false, data: null, field, fieldErrors, formated }
    }
}




