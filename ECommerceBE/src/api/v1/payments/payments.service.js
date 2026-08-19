import { PAYMENT_TRANSITIONS } from "../../../constants/paymentStates.js";
import Order from "../../../models/Order.model.js"
import Payment from "../../../models/Payment.model.js";
import ApiError from './../../../utils/ApiError.js';
import razorpay from "../../../providers/payments/razorpay.provider.js";
import crypto from "crypto";
import env from "../../../config/env.js";

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
               400,
               "Already paid"
          )
     }

     const payment = await Payment.create({
          order: order._id,
          provider:"razorpay",
          amount: order.totalAmount
     })

     const razorpayOrder = await razorpay.orders.create({
          amount:order.totalAmount*100,

          currency:"INR",

          receipt: order.orderNumber
     })

     payment.providerOrderId=razorpayOrder.id;
     await payment.save();

     return{
          payment,
          razorpayOrder,
     }
}

export const updatePaymentStatus= async (paymentId, newStatus) => {
     const payment = await Payment.findById(paymentId);
     
     if(!payment){
          throw new ApiError(
               404,
               "Payment not found"
          )
     }

     const allowed = PAYMENT_TRANSITIONS[payment.status];

     if(!allowed.includes(newStatus)){
          throw new ApiError(
               400,
               `Cannot move payment from ${payment.status} to ${newStatus}`
          )
     }

     payment.status=newStatus;

     await payment.save();

     if(newStatus=='paid'){
          const order = await Order.findById(payment.order);

          if(!order){
               throw new ApiError(
                    404,
                    "Order not found"
               )
          }

          order.paymentStatus='paid';

          order.paidAt=  new Date();

          await order.save();
     }

     return payment;
}

export const handleWebhook= async (signature,payload) => {
     const expectedSignature = crypto.createHmac("sha256",env.RAZORPAY_WEBHOOK_SECRET).update(payload).digest("hex");

     if(signature!==expectedSignature){
          throw new ApiError(
               401,
               "Invalid webhook signature"
          )
     }

     const event = JSON.parse(payload);
     if(event.event==="payment.captured"){
          const paymentId=event.payload.payment.entity.id;
          const razorpayOrderId = event.payload.entity.order_id;

          const payment = await Payment.findOne({
               providerOrderId: razorpayOrderId
          })
           if (!payment) {
               throw new ApiError(
                    404,

                    "Payment not found"
               );
          }

          payment.providerPaymentId=paymentId;
          await payment.save();

          await updatePaymentStatus(
               payment._id,
               "paid"
          )
     }
     return true;
}