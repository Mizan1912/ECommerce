import {z} from "zod";

export const addToCartSchema =
     z.object({
          body:z.object({
               productId: z.string(),

               quantity: z.number().int().positive(),
          })
     })

export const updateCartItemSchema =
     z.object({
          body:z.object({
               quantity:z.number().int().positive(),
          }),

          params: z.object({
               productId:z.string()
          })
     }) 
     
     
export const removeCartItemSchema = 
     z.object({
          params :z.object({
               productId:z.string(),
          })
     })     