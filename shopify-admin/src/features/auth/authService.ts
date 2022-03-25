import {publicRequest} from '../../requestMethod'
import axios from 'axios'
const API_URL = '/auth'

export interface userData  {
    email: String,
    password: String
  }

// Register user
const register = async (userData:userData) =>{
    const response = await publicRequest.post(API_URL + '/register', userData)

    if(response.data){
        localStorage.setItem('user', JSON.stringify(response.data))
    }

    return response.data
}


// Login user
const login = async (userData:userData) =>{
    const response = await publicRequest.post(API_URL + '/login', userData)

    if(response.data){
        localStorage.setItem('user', JSON.stringify(response.data))
    }
    console.log({data: response.data})
    return response.data
}


// Logout user
const logout = async ()=>{
    localStorage.removeItem('user')
}

const authService = {
    register, 
    logout,
    login
}

export default authService