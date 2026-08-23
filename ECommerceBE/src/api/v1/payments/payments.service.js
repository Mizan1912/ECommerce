import { PAYMENT_TRANSITIONS } from "../../../constants/paymentStates.js";
import Order from "../../../models/Order.model.js"
import Payment from "../../../models/Payment.model.js";
import Product from "../../../models/Product.model.js";
import ProcessedEvent from "../../../models/ProcessedEvent.model.js";
import ApiError from './../../../utils/ApiError.js';
import razorpay from "../../../providers/payments/razorpay.provider.js";
import crypto from "crypto";
import env from "../../../config/env.js";
import mongoose from "mongoose";
import { getTransactionSession } from "../../../utils/db.utils.js";

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

     if(newStatus=='failed'){
          const order = await Order.findById(payment.order);

          if(order){
               order.paymentStatus='failed';
               order.status='cancelled';
               await order.save();

               // Restore stock atomically
               const session = await getTransactionSession();
               if (session) session.startTransaction();
               try {
                    for(const item of order.items){
                         await Product.updateOne(
                              { _id: item.product },
                              { $inc: { stock: item.quantity } },
                              { session: session || undefined }
                         );
                    }
                    if (session) await session.commitTransaction();
               } catch (error) {
                    if (session) await session.abortTransaction();
                    console.error("Failed to restore stock on payment failure:", error);
               } finally {
                    if (session) session.endSession();
               }
          }
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
     const eventId = event.id;

     if (eventId) {
          const alreadyProcessed = await ProcessedEvent.findOne({ eventId });
          if (alreadyProcessed) {
               console.log(`Webhook event ${eventId} already processed.`);
               return true;
          }
     }

     if(event.event==="payment.captured"){
          const paymentId=event.payload.payment.entity.id;
          const razorpayOrderId = event.payload.payment.entity.order_id;

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
     } else if(event.event==="payment.failed"){
          const paymentId=event.payload.payment.entity.id;
          const razorpayOrderId = event.payload.payment.entity.order_id;

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
                "failed"
           )
     }

     if (eventId) {
          await ProcessedEvent.create({ eventId, provider: "razorpay" });
     }

     return true;
}