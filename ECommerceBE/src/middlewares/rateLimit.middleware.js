import rateLimit from "express-rate-limit";
import { success } from "zod";

const globalRateLimiter = rateLimit({
    windowMs:15*60*1000,

    max:100,

    message:{
        success : false,
        message: "Too many requests, try again later",
    }
})

export default globalRateLimiter;