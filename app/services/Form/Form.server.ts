import { DynamicFormField, Prisma } from "@prisma/client"
import canUser, { AbilityType } from "~/utils/casl/ability"
import { db } from "../db.server"
import { JsonFunction, json } from '@remix-run/node'
import customErr, { Response, ResponseType, errorHandler } from "~/utils/handler.server"
import getParams from "~/utils/params/getParams.server";
import { searchFunction } from "~/utils/params/search.server";
import { filterFunction } from "~/utils/params/filter.server";
import { canPerformAction } from "~/utils/casl/canPerformAction"

interface DynamicForm {
    name: string;
    description: string;
    fields: any;
}

type DynamicFormFieldUpdateManyData = {
    name?: string;
    label?: string;
    type?: string;
    defaultValue?: string;
    required?: boolean;
    placeholder?: string;
    description?: string;
    order?: number;
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
        const canCreate = await canUser(userId, 'create', 'Form', {})
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
                        data: formData?.fields as any
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

        const searchParams = searchFunction(search, 'DynamicForm', ['name', 'description']);
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

    const canUpdate = await canUser(userId, 'update', 'DynamicFormField', {
        clientId,
    });
    if (canUpdate?.status !== 200) {
        return canUpdate;
    }

    try {
        const updatedDynamicFormField = await db.dynamicForm.upsert({
            where: { id: formId },
            update: {
                name: data.name,
                description: data.description,
                createdBy: userId,
                fields: {
                    updateMany:
                        data?.fields?.map((field: any) => ({
                            where: { id: field.id },
                            data: {
                                name: field.name,
                                label: field.label,
                                type: field.type,
                                defaultValue: field.defaultValue,
                                required: field.required,
                                placeholder: field.placeholder,
                                description: field.description,
                                order: field.order,
                            },
                        })),

                },
            },
            create: {
                name: data?.name,
                description: data?.description,
                createdBy: userId,
                client: {
                    connect: {
                        id: clientId
                    }
                },
                fields: {
                    createMany: {
                        data: data?.fields?.map((field: any) => ({
                            name: field?.name,
                            label: field?.label,
                            type: field?.type,
                            defaultValue: field?.defaultValue,
                            required: field?.required,
                            placeholder: field?.placeholder,
                            description: field?.description,
                            order: field?.order,
                        })),

                    },
                }
            },
            include: {
                fields: true,
            },
        });

        return json(Response({
            data: updatedDynamicFormField,
            message: 'Dynamic form field updated successfully',
        }), { status: 200 })
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
        const canViewFormFields = await canPerformAction(userId, 'read', 'DynamicFormField', { clientId });
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
