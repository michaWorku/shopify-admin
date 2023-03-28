 import canUser from './ability'
/**
 * Checks if the user has permission to view a User entity.
 * @async function canViewUser
 * @param {string} userId - The ID of the user.
 * @param {object} entity - The User entity to check permissions against.
 * @returns {Promise<boolean>} - A Promise that resolves to a boolean value indicating whether the user has permission to view the User entity.
 */
 export const canViewUser = async(userId: string, entity: object = {}):Promise<boolean> => {
     const icanViewUser = await canUser(userId, 'read', 'User', entity)
     const canView = await icanViewUser?.ok
 
     return canView
 }
 
