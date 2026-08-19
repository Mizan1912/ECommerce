import Order from "../../../models/Order.model.js"
import Payment from "../../../models/Payment.model.js";
import ApiError from './../../../utils/ApiError.js';

export const initiatePayment = async (userId, orderNumber) => {
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

     if(order.paymentStatus === "paid"){
          throw new ApiError(
               404,
               "Already paid"
          )
     }

     const payment = await Payment.create({
          order: order._id,
          provider:"razorpay",
          amount: order.totalAmount
     })

     return{
          payment,
          order,
     }
}