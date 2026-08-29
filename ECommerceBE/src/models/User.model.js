import mongoose from "mongoose";
import { lowercase } from "zod";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },

    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
    },

    password:{
        type:String,
        required:true,
        select:false
    },

    role:{
        type:String,
        enum: ["customer",'admin'],
        default:"customer",
    },
    
    passwordResetToken:{
        type:String,
    },

    passwordResetExpires:{
        type:Date,
    }
},{timestamps:true});

const User = mongoose.model("User",userSchema);

export default User;