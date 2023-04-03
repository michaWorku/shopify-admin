import { DynamicFormField, Prisma } from "@prisma/client"
import canUser from "~/utils/casl/ability"
import { db } from "../db.server"
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
export const createForm = async (formData: DynamicForm, userId: string, clientId: string): Promise<ResponseType> => {
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

        return Response({
            data,
            message: 'Form successfully created',
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
export const getAllClientDynamicForms = async (request: Request, clientId?: string): Promise<ResponseType> => {
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
        });
    } catch (error) {
        console.log('Error occurred loading dynamic forms.');
        console.dir(error, { depth: null });
        return errorHandler(error);
    }
};
