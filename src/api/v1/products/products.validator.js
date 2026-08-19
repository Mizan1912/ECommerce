import { z } from "zod";

export const createProductSchema =
  z.object({
    body: z.object({ //body mtlb req body me aarha h
      title: z.string().min(3),

      description:
        z.string().min(10),

      category:
        z.string().min(2),

      price:
        z.number().nonnegative(),

      stock:
        z.number().nonnegative(),
    }),
  });

export const getProductSchema = 
  z.object({
     query: z.object({
          q: z.string().optional(),

          category: z.string().optional(),

          minPrice : z.string().optional(),

          maxPrice : z.string().optional(),

          sort : z.string().optional(),
          
          page : z.string().optional(),

          limit : z.string().optional(),

          isActive : z.string().optional()
     })
  })

export const getProductBySlugSchema = 
  z.object({
     params: z.object({
          slug:z.string().min(1),
     })
  })

 
export const updateProductSchema = 
  z.object({
    body:z.object({
      title: z.string().min(3).optional(),

      description:
        z.string().min(10).optional(),

      category:
        z.string().min(2).optional(),

      price:
        z.number().nonnegative().optional(),

      stock:
        z.number().nonnegative().optional(),

      isActive:
        z.boolean().optional(),
    })
  })  