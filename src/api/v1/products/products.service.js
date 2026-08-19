import Product from "../../../models/Product.model.js";
import ApiError from "../../../utils/ApiError.js";
import { getProductBySlugSchema } from './products.validator.js';

export const createProduct = 
     async(payload)=>{
          const product=await Product.create(payload)
          return product;
     }


export const getProducts = 
     async (query) =>{
          const {
               q,
               category,
               minPrice,
               maxPrice,
               sort,
               limit = 10,
               page=1,
               isActive,
          } = query;

          const filters ={
               isActive:true,
          }

          if(isActive){
               filters.isActive = isActive
          }
          
          if(q){
               filters.$text = {
                    $search:q,
               }
          }

          if(category){
               filters.category=category.toLowerCase();
          }

          if(minPrice || maxPrice){
               filters.price={};

               if(minPrice){
                    filters.price.$gte=Number(minPrice);
               }

               if(maxPrice){
                    filters.price.$lte=Number(maxPrice)
               }
          }

          let sortOption = "-createdAt";

          if(sort === "price"){
               sortOption= "price";
          }

          if(sort === "-price"){
               sortOption = "-price";
          }


          const skip = (Number(page)-1)*Number(limit);


          const products = await Product.find(filters)
               .sort(sortOption)
               .skip(skip)
               .limit(Number(limit))

          const total = await Product.countDocuments(filters);

          return {
               products,

               pagination:{
                    total,
                    page:Number(page),
                    limit:Number(limit),
                    
                    totalPages:Math.ceil(total/Number(limit)), 
               }
          }


     }



export const getProductBySlug = 
     async (slug)=>{
          const product = await Product.findOne({
               slug,
               isActive:true,
          });

          if(!product){
               throw new ApiError(
                    404,
                    "Product not found"
               )
          }

          return product;
     }


export const updateProduct = 
     async(slug,payload) => {
          const product = await Product.findOne({slug,});

          if(!product){
               throw new ApiError(
                    404,
                    "Product not found"
               );
          }

          Object.assign(product,payload);

          await product.save()

          return product;
     }


export const deactivateProduct=
     async(slug)=>{
          const product = await Product.findOne({slug,});

          if(!product){
               throw new ApiError(
                    404,
                    'Product not found'
               )
          }

          product.isActive=false;

          await product.save();

          return product;
     }