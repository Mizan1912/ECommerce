import asyncHandler from "../../../utils/asyncHandler.js";
import { getMyOrders, getOrderDetails, updateOrderStatus, cancelOrder } from "./orders.service.js";

export const getMyOrdersController = asyncHandler(
     async (req,res) => {
          const orders = await getMyOrders(req.user.userId);

          res.status(200).json({
               success:true,
               data:orders
          })
     }
)

export const getOrderDetailsController = asyncHandler(
     async (req,res) => {
          const order = await getOrderDetails(
               req.user.userId,
               req.validatedData.params.orderNumber
          );

          res.status(200).json({
               success:true,
               data:order
          })
     }
)


export const updateOrderStatusController =
  asyncHandler(
    async (req, res) => {
      const order =
        await updateOrderStatus(
          req.validatedData.params.orderNumber,

          req.validatedData.body.status
        );

      res.status(200).json({
        success: true,

        message:
          "Order status updated",

        data: {
          order,
        },
      });
    }
  );

export const cancelOrderController = asyncHandler(
     async (req, res) => {
          const order = await cancelOrder(
               req.user.userId,
               req.user.role,
               req.validatedData.params.orderNumber
          );

          res.status(200).json({
               success: true,
               message: "Order cancelled successfully",
               data: {
                    order
               }
          });
     }
);