
import { success } from 'zod';
import asyncHandler from './../../../utils/asyncHandler.js';

import { createProduct, deactivateProduct, getProductBySlug, getProducts, updateProduct } from './products.service.js';

export const createProductController=
     asyncHandler(
          async(req,res)=>{
               const product = await createProduct(req.validatedData.body);

               res.status(200).json({
                    success:true,
                    message:"Product created successfully",

                    data:{product}
               })
          }
     )

export const getProductsController=
     asyncHandler(
          async(req,res)=>{
               const result = await getProducts(req.validatedData.query);

               res.status(200).json({
                    success: true,
                    message: "Products fetched successfully",

                    data:result.products,
                    meta:result.pagination
               })
          }
     )


export const getProductBySlugController = 
     asyncHandler(
          async(req,res)=>{
               const product = await getProductBySlug(req.validatedData.params.slug);

               res.status(200).json({
                    success:true,
                    message:"Product fetched successfully",

                    data:{
                         product,
                    }
               })
          }
     )     

export const updateProductController = 
     asyncHandler(
          async(req,res)=>{
               const product = await updateProduct(
                    req.validatedData.params.slug,
                    req.validatedData.body,
               )

               res.status(200).json({
                    success:true,
                    message: "Product updated successfully",
                    data:{
                         product,
                    }
               })
          }
     )

export const deactivateProductController =
     asyncHandler(
          async(req,res)=>{
               const product = await deactivateProduct(req.validatedData.params.slug);

               res.status(200).json({
                    success:true,
                    message:"Product deactivated",
                    data:{
                         product
                    }
               })
          }
     )     