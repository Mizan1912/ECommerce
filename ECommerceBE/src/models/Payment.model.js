import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
     order:{
          type: mongoose.Schema.Types.ObjectId,

          ref:"Order",

          required:  true,
     },

     provider:{
          type:String,
          required:true,
     },

     providerOrderId:{
          type: String,
     },

     providerPaymentId:{
          type:String,
     },

     amount:{
          type:Number,
          required:true,
     },

     status:{
          type:String,
          enum:[
               "pending",
               "paid",
               'failed',
               "refunded"
          ],

          default:"pending",
     },
},{timestamps:true});


const Payment = mongoose.model("Payment",paymentSchema);

export default Payment;