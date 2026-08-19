import Idempotency from "../../../models/Idempotency.model.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import { checkout } from "./checkout.service.js";

export const checkoutController = asyncHandler(
     async (req,res) => {
          const order = await checkout(req.user.userId);
          const payload = {
          success: true,

          message:
               "Checkout successful",

          data: {
               order,
          },
          };

          if(req.idempotencyKey){
               await Idempotency.create({
                    key:req.idempotencyKey,
                    response:payload,
               })
          }

          res.status(201).json(
               payload
          );
     }
)