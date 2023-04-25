import type { DynamicFormField, Prisma } from "@prisma/client"
import canUser, { AbilityType } from "~/utils/casl/ability"
import { db } from "../db.server"
import { json } from '@remix-run/node'
import customErr, { Response, errorHandler } from "~/utils/handler.server"
import getParams from "~/utils/params/getParams.server";
import { searchFunction } from "~/utils/params/search.server";
import { filterFunction } from "~/utils/params/filter.server";
import { canPerformAction } from "~/utils/casl/canPerformAction"

interface DynamicForm {
    name: string;
    description: string;
    fields: any;
}

/**
 * Creates a dynamic form with a set of form fields
 * @param {DynamicForm} formData - The data of the dynamic form to create
 * @param {string} userId - The ID of the user creating the form
 * @param {string} clientId - The ID of the client associated with the form
 * @returns {Promise<ResponseType>} - A promise that resolves to a response object
*/
export const createForm = async (formData: DynamicForm, userId: string, clientId: string): Promise<any> => {
    try {
        const canCreate = await canUser(userId, 'create', 'DynamicForm', {clientId})
        if (canCreate?.status !== 200) {
            return canCreate
        }

        if (!formData.name || !formData.fields) {
            throw new customErr("Custom_Error", "Invalid form data!", 400);
        }

        // Create form with associated fields
        const data = await db.dynamicForm.create({
            data: {
                name: formData.name,
                description: formData.description,
                createdBy: userId,
                client: {
                    connect: {
                        id: clientId
                    }
                },
                fields: {
                    createMany: {
                        data: formData?.fields?.map((field: any) => {
                            const { id, ...rest } = field
                            return rest
                        })
                    }
                }
            },
            include: {
                fields: true
            }
        });

        return json(Response({
            data,
            message: 'Form successfully created',
        }), {
            status: 201
        })
    } catch (err) {
        return errorHandler(err)
    }
}

/**
 * Retrieves all dynamic forms for the specified client based on the specified request parameters.
 * @async function getAllClientDynamicForms
 * @param {Request} request - The HTTP request object containing the request parameters.
 * @param {string} clientId - The ID of the client associated with the forms.
 * @returns {Promise<Response>} - The HTTP response containing the dynamic forms and their metadata.
 * @throws {customErr} - An error indicating that no dynamic forms were found.
 * @throws {Error} - An error indicating that an unexpected error occurred.
 */
export const getAllClientDynamicForms = async (request: Request, clientId?: string): Promise<any> => {
    try {
        const { sortType, sortField, skip, take, pageNo, search, filter, exportType } = getParams(request);

        const searchParams = searchFunction(search, 'DynamicForm');
        const filterParams = filterFunction(filter, 'DynamicForm');

        const dynamicFormsWhere: Prisma.DynamicFormWhereInput = {
            deletedAt: null,
            clientId,
            ...searchParams,
            ...filterParams,
        };

        const dynamicFormsCount = await db.dynamicForm.count({ where: dynamicFormsWhere });

        if (dynamicFormsCount === 0) {
            throw new customErr('Custom_Error', 'No dynamic forms found', 404);
        }

        const dynamicForms = await db.dynamicForm.findMany({
            take,
            skip,
            orderBy: [{ [sortField]: sortType }],
            where: dynamicFormsWhere,
            include: {
                fields: true
            }
        });

        let exportData;

        if (exportType === 'page') {
            exportData = dynamicForms;
        } else if (exportType === 'filtered') {
            exportData = await db.dynamicForm.findMany({
                orderBy: [{ [sortField]: sortType }],
                where: dynamicFormsWhere,
            });
        } else {
            exportData = await db.dynamicForm.findMany({});
        }

        return Response({
            data: dynamicForms,
            metaData: {
                page: pageNo,
                pageSize: take,
                total: dynamicFormsCount,
                sort: [sortField, sortType],
                searchVal: search,
                filter,
                exportType,
                exportData,
            },
        })
    } catch (error) {
        console.log('Error occurred loading dynamic forms.');
        console.dir(error, { depth: null });
        return errorHandler(error);
    }
};

/**
 * Retrieves all dynamic forms for the specified client.
 * @async function getAllClientDynamicForms
 * @param {string} userId - The ID of the user to retrieve dynamic forms for.
 * @param {string} clientId - The ID of the client associated with the forms.
 * @returns {Promise<Response>} - The HTTP response containing the dynamic forms and their metadata.
 * @throws {customErr} - An error indicating that no dynamic forms were found.
 * @throws {Error} - An error indicating that an unexpected error occurred.
 */
 export const getClientDynamicForms = async (userId: string, clientId?: string): Promise<any> => {
    try {
        const canViewDynamicForms = await canUser(userId, 'read', 'DynamicForm', {clientId});
        if (canViewDynamicForms?.status !== 200) {
            return canViewDynamicForms
        }
        const dynamicFormsWhere: Prisma.DynamicFormWhereInput = {
            deletedAt: null,
            clientId
        };

        const dynamicFormsCount = await db.dynamicForm.count({ where: dynamicFormsWhere });

        if (dynamicFormsCount === 0) {
            throw new customErr('Custom_Error', 'No dynamic forms found', 404);
        }

        const dynamicForms = await db.dynamicForm.findMany({
            where: dynamicFormsWhere,
            include: {
                fields: true
            }
        });

        return Response({
            data: dynamicForms,
            metaData: {
                total: dynamicFormsCount
            },
        })
    } catch (error) {
        console.log('Error occurred loading dynamic forms.');
        console.dir(error, { depth: null });
        return errorHandler(error);
    }
};
/**
 * Get a dynamic form by unique field.
 * @async
 * @function getDynamicFormByField
 * @param {string} formId - The ID of the dynamic form to get.
 * @returns {Promise<object>} The dynamic form object.
 * @throws {Error} If no form is found with the given ID.
 */
export const getDynamicFormByField = async (formId: string): Promise<any> => {
    try {
        if (!formId) {
            throw new customErr('Custom_Error', 'Form ID is required', 404);
        }

        const form = await db.dynamicForm.findUnique({
            where: {
                id: formId,
            },
            include: {
                fields: true
            }
        });
        console.dir({ form }, { depth: null });
        if (!form) {
            throw new customErr('Custom_Error', `Form not found with ${formId}`, 404);
        }

        return Response({
            data: form,
        })
    } catch (error) {
        return errorHandler(error);
    }
};

/**
 * Updates a dynamic form field by ID
 * @async
 * @function updateDynamicFormById
 * @param {string} formId - ID of the dynamic form to update
 * @param {object} data - Updated dynamic form field data
 * @param {string} userId - The ID of the user updating the dynamic form
 * @param {string} clientId - The ID of the client associated with the forms.
 * @returns {Promise<object>} Updated dynamic form  object
 * @throws {customErr} If no dynamic form found with given ID
 */
export const updateDynamicFormById = async (formId: string, data: DynamicForm, userId: string, clientId: string): Promise<any> => {
    if (!formId) {
        throw new customErr('Custom_Error', 'Dynamic form field ID is required', 404);
    }

    const canUpdate = await canUser(userId, 'update', 'DynamicForm', {
        clientId,
    });
    if (canUpdate?.status !== 200) {
        return canUpdate;
    }

    try {
        const updatedDynamicFormField = await db.dynamicForm.update({
            where: {
                id: formId,
            },
            data: {
                name: data.name,
                description: data.description,
                createdBy: userId,
                fields: {
                    updateMany:
                        data?.fields?.map((field: any) => ({
                            where: { id: field.id },
                            data: {
                                name: field?.name,
                                label: field?.label,
                                type: field?.type,
                                defaultValue: field?.defaultValue,
                                required: field?.required,
                                placeholder: field?.placeholder,
                                description: field?.description,
                                order: field?.order,
                                options: field?.options
                            },
                        })),
                    createMany: {
                        data: data?.fields?.filter((field: any) => !field?.id).map((field: any) => ({
                            name: field?.name,
                            label: field?.label,
                            type: field?.type,
                            defaultValue: field?.defaultValue,
                            required: field?.required,
                            placeholder: field?.placeholder,
                            description: field?.description,
                            order: field?.order,
                            options: field?.options
                        })),

                    },
                }
            },
            include: {
                fields: true,
            },
        })

        return json(Response({
            data: updatedDynamicFormField,
            message: 'Dynamic form field updated successfully',
        }), { status: 200 })
    } catch (error) {
        return errorHandler(error);
    }
};

/**
 * Updates a dynamic form field by ID
 * @async function updateDynamicFormField
 * @param {string} formId - The ID of the dynamic form
 * @param {DynamicFormField} dynamicFormField - The updated dynamic form field object
 * @param {string} userId - The ID of the user making the request
 * @param {string} clientId - The ID of the client making the request
 * @returns {Promise<any>} - A Promise that resolves to the updated dynamic form field object or an error object
 */
export const updateDynamicFormField = async (
    formId: string,
    dynamicFormField: DynamicFormField,
    userId: string,
    clientId: string
): Promise<any> => {

    if (!formId) {
        throw new customErr(
            "Custom_Error",
            "Dynamic form ID is required",
            404
        );
    }

    const canUpdate = await canUser(userId, "update", "DynamicForm", {
        clientId,
    });

    if (canUpdate?.status !== 200) {
        return canUpdate;
    }
    const data = {
        name: dynamicFormField?.name,
        label: dynamicFormField?.label,
        order: dynamicFormField?.order,
        required: dynamicFormField?.required,
        type: dynamicFormField?.type,
        defaultValue: dynamicFormField?.defaultValue as any,
        description: dynamicFormField?.description,
        placeholder: dynamicFormField?.placeholder,
        options: dynamicFormField?.options as any
    }

    try {
        const updatedDynamicFormField = await db.dynamicFormField.upsert({
            where: {
                id: dynamicFormField?.id,
            },
            update: {
                ...data
            },
            create: {
                dynamicFroms: {
                    connect: {
                        id: formId
                    }
                },
                ...data
            }
        });

        return json(
            Response({
                data: updatedDynamicFormField,
                message: "Dynamic form field updated successfully",
            }),
            { status: 200 }
        );
    } catch (error) {
        return errorHandler(error);
    }
};

/**
 * Deletes a dynamic form field by ID.
 * 
 * @param {string} formId - The ID of the dynamic form to which the field belongs.
 * @param {string} fieldId - The ID of the dynamic form field to delete.
 * @param {string} userId - The ID of the user performing the delete operation.
 * @param {string} clientId - The ID of the client associated with the dynamic form.
 * @returns {Promise<{ data: any, message: string }>} A promise that resolves to an object containing the deleted dynamic form field and a success message.
 * @throws {customErr} Throws a custom error if the form ID or field ID are missing or if the user does not have permission to delete the field.
 */
export const deleteDynamicFormField = async (
    formId: string,
    fieldId: string,
    userId: string,
    clientId: string
): Promise<{ data: any, message: string }> => {
    if (!formId) {
        throw new customErr('Custom_Error', 'Dynamic form ID is required', 404);
    }

    if (!fieldId) {
        throw new customErr('Custom_Error', 'Dynamic form field ID is required', 404);
    }

    const canDelete = await canUser(userId, 'delete', 'DynamicForm', {
        clientId,
    });

    if (canDelete?.status !== 200) {
        return canDelete;
    }

    try {

        const deletedDynamicFormField = await db.dynamicFormField.update({
            where: {
                id: String(formId),
            },
            data: {
                deletedAt: new Date(),
            },
        });

        return {
            data: deletedDynamicFormField,
            message: 'Dynamic form field deleted successfully',
        };
    } catch (error) {
        return errorHandler(error);
    }
};

/**
 * Deletes a dynamic form with the given ID.
 * @async
 * @function deleteDynamicForm
 * @param {string} formId - The ID of the dynamic form to delete.
 * @param {string} userId - The ID of the user deleting the dynamic form.
 * @param {string} clientId - The ID of the client associated with the forms. 
* @returns {Promise<object>} The deleted dynamic form object.
 * @throws {Error} If no dynamic form is found with the given ID.
 */
export const deleteDynamicForm = async (formId: string, userId: string, clientId: string): Promise<any> => {
    try {
        if (!formId) {
            throw new customErr('Custom_Error', 'Dynamic Form ID is required', 404);
        }

        const canDelete = await canUser(userId, 'delete', 'DynamicForm', {
            clientId,
        });

        if (canDelete?.status !== 200) {
            return canDelete;
        }

        const dynamicForm = await db.dynamicForm.update({
            where: {
                id: String(formId),
            },
            data: {
                deletedAt: new Date(),
            },
        });

        return json(
            Response({
                data: dynamicForm,
                message: 'Dynamic Form deleted successfully',
            }),
            {
                status: 200,
            }
        );
    } catch (error) {
        return errorHandler(error);
    }
};

/**
 * Retrieves all dynamic forms for a given client, with associated permissions and capabilities.
 *
 * @async
 * @function getDynamicForms
 * @param {Request} request - The HTTP request object.
 * @param {string} userId - The ID of the user to retrieve dynamic forms for.
 * @param {string} clientId - The ID of the client to retrieve dynamic forms for.
 * @returns {Promise<Object>} An object containing the retrieved dynamic forms with associated permissions and capabilities.
 * @throws {customErr} Throws a custom error if the user does not have permission to access the dynamic forms, or if an error occurs while retrieving them.
 */
export const getDynamicForms = async (request: Request, userId: string, clientId: string): Promise<Object> => {
    try {
        const canViewDynamicForms = await canUser(userId, 'read', 'DynamicForm', {});
        if (canViewDynamicForms?.status !== 200) {
            const canViewDynamicFormsPartial = await canUser(userId, 'read', 'DynamicForm', {}, AbilityType.PARTIAL);
            if (!canViewDynamicFormsPartial?.ok) {
                return canViewDynamicFormsPartial;
            }
        }
        const dynamicForms = await getAllClientDynamicForms(request, clientId);
        if (dynamicForms?.data) {
            await setDynamicFormPermissions(userId, dynamicForms.data, clientId);
        }
        return dynamicForms;
    } catch (err) {
        return errorHandler(err);
    }
};

/**
 * Sets Dynamic form permissions for a given client.
 *
 * @async
 * @function setDynamicFormPermissions
 * @param {string} userId - The ID of the user to set permissions for.
 * @param {Object[]} dynamicForms - An array of dynamic forms to set permissions for.
 * @param {string} clientId - The ID of the client to set permissions for.
 * @returns {Promise<void>} A promise that resolves when the permissions have been set.
 * @throws {customErr} Throws a custom error if the client or user cannot be found.
 */
const setDynamicFormPermissions = async (userId: string, dynamicForms: any[], clientId: string): Promise<void> => {
    const promises = dynamicForms.map(async (dynamicFormData: any, index: number) => {
        const canEdit = await canPerformAction(userId, 'update', 'DynamicForm', { clientId });
        const canViewFormFields = await canPerformAction(userId, 'read', 'DynamicForm', { clientId });
        const canDelete = await canPerformAction(userId, 'delete', 'DynamicForm', { clientId });
        dynamicForms[index] = {
            ...dynamicFormData,
            canEdit,
            canDelete,
            canViewFormFields
        };
    });
    await Promise.all(promises);
};

/**
 * Retrieves all dynamic form fields for the specified form based on the specified request parameters.
 * @async function getAllFormFields
 * @param {Request} request - The HTTP request object containing the request parameters.
 * @param {string} formId - The ID of the form associated with the dynamic form fields.
 * @returns {Promise<Response>} - The HTTP response containing the dynamic forms fiedlds and their metadata.
 * @throws {customErr} - An error indicating that no dynamic form fields were found.
 * @throws {Error} - An error indicating that an unexpected error occurred.
 */
export const getAllFormFields = async (request: Request, formId: string): Promise<any> => {
    if (!formId) {
        throw new customErr('Custom_Error', 'Form ID is required', 404);
    }
    try {
        const { sortType, sortField, skip, take, pageNo, search, filter, exportType } = getParams(request);

        const searchParams = searchFunction(search, 'DynamicFormField');
        const filterParams = filterFunction(filter, 'DynamicFormField');

        const dynamicFormFieldsWhere: Prisma.DynamicFormFieldWhereInput = {
            deletedAt: null,
            formId,
            ...searchParams,
            ...filterParams,
        };

        const dynamicFormFieldsCount = await db.dynamicFormField.count({ where: dynamicFormFieldsWhere });

        if (dynamicFormFieldsCount === 0) {
            throw new customErr('Custom_Error', 'No dynamic form fields found', 404);
        }

        const dynamicFormFields = await db.dynamicFormField.findMany({
            take,
            skip,
            orderBy: [{ [sortField]: sortType }],
            where: dynamicFormFieldsWhere,
        });

        let exportData;

        if (exportType === 'page') {
            exportData = dynamicFormFields;
        } else if (exportType === 'filtered') {
            exportData = await db.dynamicFormField.findMany({
                orderBy: [{ [sortField]: sortType }],
                where: dynamicFormFieldsWhere,
            });
        } else {
            exportData = await db.dynamicFormField.findMany({});
        }

        return Response({
            data: dynamicFormFields.map((field: any) => ({
                ...field,
                canEdit: true,
                canDelete: true,
            })),
            metaData: {
                page: pageNo,
                pageSize: take,
                total: dynamicFormFieldsCount,
                sort: [sortField, sortType],
                searchVal: search,
                filter,
                exportType,
                exportData,
            },
        })
    } catch (error) {
        console.log('Error occurred loading dynamic form fields.');
        console.dir(error, { depth: null });
        return errorHandler(error);
    }
};