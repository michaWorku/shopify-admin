import {privateRequest, publicRequest} from '../../requestMethod'
const API_URL = '/users'

export interface userData {
    name: string;
    email: string;
    photo?: string;
    role: string;
    password: string | undefined;
    passwordConfirm: string | undefined;
  }

export interface userWithId{ 
    userId: string, 
    userData:userData
}
// Add user
const addUser = async (userData:userData) =>{
    const response = await privateRequest.post(API_URL , userData)

    return response.data
}

// Get All users
const getUsers = async () =>{
    const response = await privateRequest.get(API_URL)

    return response.data
}

// Get user
const getUser = async (userId : string) =>{
    const response = await privateRequest.get(API_URL + userId)

    return response.data
}

// Update user
const updateUser = async ( {userId, userData} : userWithId ) =>{
    const response = await privateRequest.put(API_URL + userId , userData)

    return response.data
}
// Delete user
const deleteUser = async (userId : string) =>{
    const response = await privateRequest.delete(API_URL + userId)

    return response.data
}

const userService = {
    addUser,
    getUser,
    getUsers,
    updateUser, 
    deleteUser
}

export default userService
