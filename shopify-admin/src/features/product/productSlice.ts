import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import productService, { productData, productWithId } from './productService'

// Get user from local storage
const user = JSON.parse(localStorage.getItem('user') as string)

const initialState = {
    products: [] as any,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
}

// Add product
export const addProduct = createAsyncThunk(
    'product/addProduct', 
    async (product:productData, thunkAPI)=>{
        try {
            return await productService.addProduct(product)
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

// Get products
export const getProducts = createAsyncThunk(
    'product/getProducts', 
    async (_, thunkAPI)=>{
        try {
            return await productService.getProducts()
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

// Get product
export const getProduct = createAsyncThunk(
    'product/getProduct', 
    async (productId:string, thunkAPI)=>{
        try {
            return await productService.getProduct(productId)
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

// Update product
export const updateProduct = createAsyncThunk(
    'product/updateProduct', 
    async (productWithId: productWithId, thunkAPI)=>{
        try {
            return await productService.updateProduct(productWithId)
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

// Delete product
export const deleteProduct = createAsyncThunk(
    'product/deleteProduct', 
    async (productId: string, thunkAPI)=>{
        try {
            return await productService.deleteProduct(productId)
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


export const productSlice = createSlice({
    name:'product',
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
          .addCase(addProduct.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(addProduct.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.products.push(payload);
          })
          .addCase(addProduct.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload as string;
          })
          .addCase(getProducts.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(getProducts.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.products = action.payload;
          })
          .addCase(getProducts.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload as string;
          })
          .addCase(getProduct.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(getProduct.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.products = action.payload;
          })
          .addCase(getProduct.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload as string;
            
          })
          .addCase(updateProduct.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(updateProduct.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.products[
                state.products.findIndex((item:any) => item._id === action.payload.id)
              ] = action.payload.product;
          })
          .addCase(updateProduct.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload as string;
            
          })
          .addCase(deleteProduct.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(deleteProduct.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.products = state.products.filter(
              (product:any) => product._id !== action.payload.id
            );
          })
          .addCase(deleteProduct.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload as string;
          });
    }
})


export const { reset } = productSlice.actions
export default productSlice.reducer