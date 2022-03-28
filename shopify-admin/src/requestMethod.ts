import axios from 'axios'

const BASE_URL = "http://localhost:5000/api";

const auth = JSON.parse(localStorage.getItem('persist:root') as string)?.auth;

const currentUser = auth && JSON.parse(auth).user;
const TOKEN = currentUser?.token;

export const publicRequest = axios.create({
    baseURL: BASE_URL
});

export const privateRequest = axios.create({
    baseURL : BASE_URL,
    headers: {
        Authorization: `Bearer ${TOKEN}`
    }
})
