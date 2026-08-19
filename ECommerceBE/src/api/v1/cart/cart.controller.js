import { success } from "zod";
import asyncHandler from "../../../utils/asyncHandler.js";
import { addToCart, getCart } from "./cart.service.js";
import {
  updateCartItem,
  removeCartItem,
  clearCart,
} from "./cart.service.js";

export const addToCartController = asyncHandler(
    async (req,res) => {
        const cart = await addToCart(req.user.userId,req.validatedData.body);

        res.status(200).json({
            success:true,
            message:"Item added to cart",

            data:{
                cart
            }
        })
    }
)

export const getCartController = asyncHandler(
    async (req,res) => {
        const result = await getCart(req.user.userId);

        res.status(200).json({
            success:true,
            message: "Cart Fetched",
            data: result
        })
    }
)


export const updateCartItemController =
  asyncHandler(
    async (req, res) => {
      const cart =
        await updateCartItem(
          req.user.userId,

          req.validatedData.params
            .productId,

          req.validatedData.body
            .quantity
        );

      res.status(200).json({
        success: true,

        message:
          "Cart updated",

        data: {
          cart,
        },
      });
    }
  );

export const removeCartItemController =
  asyncHandler(
    async (req, res) => {
      const cart =
        await removeCartItem(
          req.user.userId,

          req.validatedData.params
            .productId
        );

      res.status(200).json({
        success: true,

        message:
          "Item removed",

        data: {
          cart,
        },
      });
    }
  );  


export const clearCartController =
  asyncHandler(
    async (req, res) => {
      await clearCart(
        req.user.userId
      );

      res.status(200).json({
        success: true,

        message:
          "Cart cleared",
      });
    }
  );  