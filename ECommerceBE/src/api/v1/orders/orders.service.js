import Order from "../../../models/Order.model.js"
import ApiError from "../../../utils/ApiError.js"

const ALLOWED_TRANSITIONS = {
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

     await order.save();
     return order;
}


