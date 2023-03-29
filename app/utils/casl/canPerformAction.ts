 import canUser from './ability'
/**
 * Checks if the user has permission to perform an action on a given entity schema.
 * @async function canPerformAction
 * @param {string} userId - The ID of the user.
 * @param {string} action - The action to perform (e.g. 'read', 'write', 'delete').
 * @param {string} schema - The entity schema to check permissions against.
 * @param {object} [entity={}] - The entity to check permissions against.
 * @returns {Promise<boolean>} - A Promise that resolves to a boolean value indicating whether the user has permission to perform the action on the entity schema.
 */
 export const canPerformAction = async(userId: string, action: string, schema: string, entity: object = {}): Promise<boolean> => {
    const canUserPerformAction = await canUser(userId, action, schema, entity);
    const canPerform = await canUserPerformAction?.ok;

    return canPerform;
};

 
