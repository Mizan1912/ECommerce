import Order from "../../../models/Order.model.js"
import Product from "../../../models/Product.model.js"
import ApiError from "../../../utils/ApiError.js"
import mongoose from "mongoose";
import { getTransactionSession } from "../../../utils/db.utils.js";

export const ALLOWED_TRANSITIONS = {
  pending: [
    "paid",
    "cancelled",
  ],

  paid: [
    "processing",
    "refunded",
  ],

  processing: [
    "shipped",
  ],

  shipped: [
    "delivered",
  ],

  delivered: [],

  refunded: [],

  cancelled: [],
};


export const getMyOrders= async (userId) => {
     return Order.find({
          user:userId
     })
     .sort("-createdAt")
}

export const getOrderDetails = async (userId,orderNumber) => {
     const order = await Order.findOne({
          user:userId,
          orderNumber
     })

     if(!order){
          throw new ApiError(
               404,
               "Order not found"
          )
     }

     return order;
}

export const updateOrderStatus = async (orderNumber,status) => {
     const order = await Order.findOne({orderNumber});
     if(!order){
          throw new ApiError(
               404,
               "Order not found"
          )
     }

     const allowed =
          ALLOWED_TRANSITIONS[
            order.status
          ];

     if (
        !allowed.includes(status)
     ) {
     throw new ApiError(
         400,
        `Cannot move order from ${order.status} to ${status}`
     );
     }

     order.status = status;
     await order.save();
     return order;
}

export const cancelOrder = async (userId, userRole, orderNumber) => {
     const order = await Order.findOne({ orderNumber });
     if (!order) {
          throw new ApiError(404, "Order not found");
     }

     if (userRole === "customer" && order.user.toString() !== userId.toString()) {
          throw new ApiError(403, "Access denied");
     }

     if (userRole === "customer" && order.status !== "pending") {
          throw new ApiError(400, "Only pending orders can be cancelled by customers");
     }

     if (["shipped", "delivered", "cancelled", "refunded"].includes(order.status)) {
          throw new ApiError(400, `Cannot cancel order with status: ${order.status}`);
     }

     const session = await getTransactionSession();
     if (session) session.startTransaction();

     try {
          // Restore stock atomically
          for (const item of order.items) {
               await Product.updateOne(
                    { _id: item.product },
                    { $inc: { stock: item.quantity } },
                    { session: session || undefined }
               );
          }

          order.status = "cancelled";
          if (order.paymentStatus === "pending") {
               order.paymentStatus = "failed";
          }
          await order.save({ session: session || undefined });

          if (session) await session.commitTransaction();
     } catch (error) {
          if (session) await session.abortTransaction();
          throw error;
     } finally {
          if (session) session.endSession();
     }

     return order;
};


