import ApiError from "../../../utils/ApiError.js";
import Product from "../../../models/Product.model.js";
import Cart from "../../../models/Cart.model.js"

export const addToCart = async(userId, payload) => {
     const {productId, quantity} = payload;

     const product = await Product.findById(productId);

     if(!product || !product.isActive){
          throw new ApiError(
               404,
               "Product not found"
          )
     }

     if(product.stock<quantity){
          throw new ApiError(
               400,
               "Insufficient stock"
          )
     }

     let cart = await Cart.findOne({
          user: userId,
     })

     if(!cart){
          cart = await Cart.create({
               user:userId,
               items:[]
          })
     }

     const existingItem = cart.items.find((item)=>
               item.product.toString()===productId
     )

     if(existingItem){
          const newQuantity = existingItem.quantity + quantity;

          if(product.stock<newQuantity){
               throw new ApiError(
                    400,
                    "Insufficient Error"
               )
          }

          existingItem.quantity=newQuantity;
          
     }

     else{
          cart.items.push({
               product:product._id,
               quantity,
               priceSnapshot: product.price,
          })
     }

     await cart.save()

     return cart;
}

export const getCart = async (userId) => {
     const cart = await Cart.findOne({
          user:userId,
     }).populate("items.product");

     if(!cart){
          return{
               items:[],
               subTotal:0,
          }
     }

     const subTotal = cart.items.reduce((acc,item)=>{
          return(
               acc+
               item.priceSnapshot*item.quantity
          )
     },0)

     return {
          cart,
          subTotal,
     }
}


export const updateCartItem = async (
     userId,
     productId,
     quantity
) => {
     const cart = await Cart.findOne({
          user:userId,
     });

     if(!cart){
          throw new ApiError(
               404,
               "Cart not found"
          );
     }

     const item = cart.items.find((item)=>
          item.product.toString()===productId
     )

     if(!item){
          throw new ApiError(
               404,
               "Cart item not found"
          )
     }

     const product = await Product.findById(productId);

     if(!product){
          throw new ApiError(
               404,
               "Product not found"
          );
     }

     if(product.stock < quantity){
          throw new ApiError(
               400,
               "Insufficient stock"
          )
     }

     item.quantity=quantity;
     await cart.save();

     return cart;


}


export const removeCartItem = async (
     userId,
     productId
) => {
     const cart = await Cart.findOne({
          user:userId
     })

     if(!cart){
          throw new ApiError(
               404,
               "Cart not found"
          )
     }

     cart.items = cart.items.filter((item)=>
          item.product.toString()!==productId
     )

     await cart.save()
     return cart;
}


export const clearCart = async (
     userId
) => {
     const cart = await Cart.findOne({
          user:userId
     })

     if(!cart){
          return;
     }

     cart.items=[]

     await cart.save();
}


export const validateCart= async (userId) => {
     const cart = await Cart.findOne({user:userId});

     if(!cart){
          throw new ApiError(
               404,
               "Cart not found"
          )
     }

     const issues=[];

     for (const item of cart.items){
          const product = item.product;
          console.log(product);
          
          if(!product.isActive){
               issues.push({
                    product:product.title,

                    issue:"Product inactive"
               })
          }

          if(product.stock<item.quantity){
               issues.push({
                    product:product.title,
                    issue:"Insufficient stock"
               })
          }
     }

     return {
          valid : issues.length===0,
          issues,
     }
}