import {privateRequest, publicRequest} from '../../requestMethod'
const API_URL = '/products'

export interface productData  {
    title: string;
    desc: string;
    img: string;
    categories:  Array<string>;
    size:  Array<string>;
    color:  Array<string>;
    price: number;
    inStock: boolean;
  }

export interface productWithId{ 
    productId: string, 
    productData:productData
}
// Add Product
const addProduct = async (productData:productData) =>{
    const response = await privateRequest.post(API_URL , productData)

    return response.data
}

// Get All Products
const getProducts = async () =>{
    const response = await publicRequest.get(API_URL)

    return response.data
}

// Get Product
const getProduct = async (productId : string) =>{
    const response = await publicRequest.get(API_URL + productId)

    return response.data
}

// Update Product
const updateProduct = async ( {productId, productData} : productWithId ) =>{
    const response = await privateRequest.put(API_URL + productId , productData)

    return response.data
}
// Delete Product
const deleteProduct = async (productId : string) =>{
    const response = await privateRequest.delete(API_URL + productId)

    return response.data
}

const productService = {
    addProduct,
    getProduct,
    getProducts,
    updateProduct, 
    deleteProduct
}

export default productService
