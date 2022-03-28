import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import userService, { userData, userWithId } from './userService'

const initialState = {
    users: [] as any,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
}

// Add user
export const addUser = createAsyncThunk(
    'user/addUser', 
    async (user:userData, thunkAPI)=>{
        try {
            return await userService.addUser(user)
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

// Get users
export const getUsers = createAsyncThunk(
    'user/getUsers', 
    async (_, thunkAPI)=>{
        try {
            return await userService.getUsers()
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

// Get user
export const getUser = createAsyncThunk(
    'user/getUser', 
    async (userId:string, thunkAPI)=>{
        try {
            return await userService.getUser(userId)
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

// Update user
export const updateUser = createAsyncThunk(
    'user/updateUser', 
    async (userWithId: userWithId, thunkAPI)=>{
        try {
            return await userService.updateUser(userWithId)
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

// Delete user
export const deleteUser = createAsyncThunk(
    'user/deleteUser', 
    async (userId: string, thunkAPI)=>{
        try {
            return await userService.deleteUser(userId)
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


export const userSlice = createSlice({
    name:'user',
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
          .addCase(addUser.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(addUser.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.users.push(payload);
          })
          .addCase(addUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload as string;
          })
          .addCase(getUsers.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(getUsers.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.users = action.payload;
          })
          .addCase(getUsers.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload as string;
          })
          .addCase(getUser.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(getUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.users = action.payload;
          })
          .addCase(getUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload as string;
            
          })
          .addCase(updateUser.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(updateUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.users[
                state.users.findIndex((item:any) => item._id === action.payload.id)
              ] = action.payload.user;
          })
          .addCase(updateUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload as string;
            
          })
          .addCase(deleteUser.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(deleteUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.users = state.users.filter(
              (user:any) => user._id !== action.payload.id
            );
          })
          .addCase(deleteUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload as string;
          });
    }
})


export const { reset } = userSlice.actions
export default userSlice.reducer