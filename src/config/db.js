import mongoose from 'mongoose';
import env from "./env.js";

const connectDB = async()=>{
    
    try {
        await mongoose.connect(env.MONGO_URI)
        console.log("DB connected");
        
    } catch (error) {
        console.error("DB Connection failed "+error);
        process.exit(1);
    }
}

export default connectDB;