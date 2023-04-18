import type * as z from 'zod'

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
        const formatted = flattenObject(error?.format())
        return { success: false, data: null, field, fieldErrors, formatted }
    }
}

/**
 * Flattens a nested object into a one-dimensional object with dot notation keys.
 * @param {Object|Array} obj - The object to flatten.
 * @param {string} prefix - A prefix to add to the keys of the flattened object. Defaults to an empty string.
 * @returns {Object} A flattened object with dot notation keys.
*/
export const flattenObject = (obj: any, prefix = '') => {
    if (Array.isArray(obj)) {
        return obj.reduce((acc, item, index) => {
            const pre = prefix.length ? `${prefix}.${index}` : `${index}`;
            Object.assign(acc, flattenObject(item, pre));
            return acc;
        }, {});
    } else if (typeof obj === 'object' && obj !== null) {
        return Object.keys(obj).reduce((acc: any, k: string) => {
            const pre = prefix.length ? `${prefix}.${k}` : `${k}`;
            if (k === '_errors') {
                return acc;
            }
            const flattened = flattenObject(obj[k], pre);
            if (Object.keys(flattened).length > 0) {
                Object.assign(acc, flattened);
            } else {
                acc[pre] = obj[k];
            }
            return acc;
        }, {});
    } else {
        return { [prefix]: obj };
    }
}

/**
 * Flattens a nested object into a one-dimensional object with dot notation keys.
 * @param obj Flattens an object that contains error messages, returning only the error messages as an object.
 * @param {Object} obj - The object to be flattened.
 * @param {string} [prefix=''] - The prefix to use for all keys in the flattened object.
 * @returns {Object} The flattened object containing only error messages.
 */
export const flattenErrors = (obj: any, prefix = '') => {
    if (Array.isArray(obj)) {
        return obj.reduce((acc, item, index) => {
            const pre = prefix.length ? `${prefix}.${index}` : `${index}`;
            Object.assign(acc, flattenObject(item, pre));
            return acc;
        }, {});
    } else if (typeof obj === 'object' && obj !== null) {
        return Object.keys(obj).reduce((acc: any, k: string) => {
            const pre = prefix.length ? `${prefix}.${k}` : `${k}`;
            if (k === 'message') {
                acc[prefix] = [obj[k]];
            } else if (Array.isArray(obj[k])) {
                obj[k].forEach((item: any, index: number) => {
                    Object.assign(acc, flattenObject(item, `${pre}.${index}`));
                });
            } else {
                Object.assign(acc, flattenObject(obj[k], pre));
            }
            return acc;
        }, {});
    } else {
        return {};
    }
}
