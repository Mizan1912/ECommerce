import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,

        ref:"Product",

        required:true
    },

    title:{
        type: String,
        required:true
    },

    quantity:{
        type:Number,
        required:true,
    },

    price:{
        type:Number,
        required:true,
    }
},{_id:false})


const orderSchema = new mongoose.Schema({

    orderNumber: {
        type: String,

        unique: true,

        required: true,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,

        ref:"User",

        required:true,
    },

    items:[orderItemSchema],

    totalAmount:{
        type:Number,
        required:true,
    },

    status:{
        type:String,

        enum:[
             "pending",

             "paid",

             "processing",

             "shipped",

             "delivered",

             "cancelled",

             "refunded",
        ],

        default:"pending"
    },

    paymentStatus: {
        type: String,

        enum: [
            "pending",

            "paid",

            "failed",

            "refunded",
        ],

        default: "pending",
    },

    paidAt:{
        type:Date,
    },
},{timestamps:true})

const Order = mongoose.model("Order",orderSchema);

export default Order