import mongoose from "mongoose";

const idempotencySchema = new mongoose.Schema({
    key:{
        type:String,
        unique:true,
        required:true,
    },
    requestHash:{
        type:String,
        required:true,
    },
    statusCode:{
        type:Number,
        required:true,
    },
    response:{
        type:Object
    },
    state:{
        type:String,
        enum:["in-flight", "completed"],
        default:"in-flight",
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:86400 // 24 hours in seconds
    }
})

const Idempotency = mongoose.model(
    "Idempotency",
    idempotencySchema
);

export default Idempotency;