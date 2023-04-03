import { DynamicFormField } from "@prisma/client"
import canUser from "~/utils/casl/ability"
import { db } from "../db.server"
import { Response, ResponseType, errorHandler } from "~/utils/handler.server"

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
            include:{
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