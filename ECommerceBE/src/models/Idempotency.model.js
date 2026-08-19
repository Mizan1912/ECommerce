import mongoose from "mongoose";

const idempotencySchema = new mongoose.Schema({
    key:{
        type:String,
        unique:true,
        required:true,
    },

    response:{
        type:Object
    }
})

const Idempotency = mongoose.model(
    "Idempotency",
    idempotencySchema
);

export default Idempotency;