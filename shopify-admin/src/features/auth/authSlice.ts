import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import authService, { userData } from './authService'

// Get user from local storage
const user = JSON.parse(localStorage.getItem('persi') as string)

const initialState = {
    user: user || null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
}



// Register user
export const register = createAsyncThunk(
    'auth/register', 
    async (user:userData, thunkAPI)=>{
        try {
            return await authService.register(user)
        } catch (error:any) {
            const message = 
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
              error.message ||
              error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    })

// Login user
export const login = createAsyncThunk(
    'auth/login', 
    async (user:userData, thunkAPI)=>{
        try {
            return await authService.login(user)
        } catch (error:any) {
            const message = 
            (error.response &&
                error.response.data &&
                error.response.data.message) ||
              error.message ||
              error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    })

// Logout user
export const logout = createAsyncThunk('auth/logout', async()=> await authService.logout())

export const authSlice = createSlice({
    name:'auth',
    initialState, 
    reducers:{
        reset: (state) => {
            state.isLoading = false
            state.isSuccess = false
            state.isError = false
            state.message = ''
        }
    },
    extraReducers:(builder)=>{
        builder
          .addCase(register.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(register.fulfilled, (state, actions) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.user = actions.payload;
          })
          .addCase(register.rejected, (state, actions) => {
            state.isLoading = false;
            state.isError = true;
            state.message = actions.payload as string;
            state.user = null;
          })
          .addCase(login.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(login.fulfilled, (state, actions) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.user = actions.payload;
          })
          .addCase(login.rejected, (state, actions) => {
            state.isLoading = false;
            state.isError = true;
            state.message = actions.payload as string;
            state.user = null;
          })
          .addCase(logout.fulfilled, (state) => {
            state.user = null;
          });
    }
})


export const { reset } = authSlice.actions
export default authSlice.reducer