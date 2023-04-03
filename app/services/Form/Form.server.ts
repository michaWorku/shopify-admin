import { DynamicFormField, Prisma } from "@prisma/client"
import canUser from "~/utils/casl/ability"
import { db } from "../db.server"
import { JsonFunction, json } from '@remix-run/node'
import customErr, { Response, ResponseType, errorHandler } from "~/utils/handler.server"
import getParams from "~/utils/params/getParams.server";
import { searchFunction } from "~/utils/params/search.server";
import { filterFunction } from "~/utils/params/filter.server";

interface DynamicForm {
    name: string;
    description: string;
    createdBy: number;
    clientId: number;
    fields: DynamicFormField[];
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

        // Create form with associated fields
        const data = await db.dynamicForm.create({
            data: {
                name: formData.name,
                description: formData.description,
                createdBy: userId,
                clientId,
                fields: {
                    create: (formData?.fields as any)?.map((field: DynamicFormField) => ({ data: field })),
                },
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

        return json(Response({
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
        }), { status: 200 })
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
 * @param {string} dynamicFormId - ID of the dynamic form to update
 * @param {object} data - Updated dynamic form field data
 * @param {string} userId - The ID of the user updating the dynamic form
 * @param {string} clientId - The ID of the client associated with the forms.
 * @returns {Promise<object>} Updated dynamic form  object
 * @throws {customErr} If no dynamic form found with given ID
 */
export const updateDynamicFormById = async (dynamicFormId: string, data: any, userId: string, clientId: string): Promise<any> => {
    if (!dynamicFormId) {
        throw new customErr('Custom_Error', 'Dynamic form field ID is required', 404);
    }

    const canUpdate = await canUser(userId, 'update', 'DynamicFormField', {
        clientId,
    });
    if (canUpdate?.status !== 200) {
        return canUpdate;
    }

    try {
        const updatedDynamicFormField = await db.dynamicFormField.update({
            where: { id: dynamicFormId },
            data,
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
 * @param {string} dynamicFormId - The ID of the dynamic form to delete.
 * @param {string} userId - The ID of the user deleting the dynamic form.
 * @param {string} clientId - The ID of the client associated with the forms. 
* @returns {Promise<object>} The deleted dynamic form object.
 * @throws {Error} If no dynamic form is found with the given ID.
 */
export const deleteDynamicForm = async (dynamicFormId: string, userId: string, clientId: string): Promise<any> => {
    try {
        if (!dynamicFormId) {
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
                id: String(dynamicFormId),
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