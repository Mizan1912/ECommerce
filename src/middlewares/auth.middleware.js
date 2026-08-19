import ApiError from "../utils/ApiError.js";
import env from '../config/env.js'
import jwt from "jsonwebtoken";

const authMiddleware = (req,res,next) =>{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return next(
            new ApiError(
                401,
                "Authentication required"
            )
        );
    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(
            token,
            env.ACCESS_TOKEN_SECRET
        );

        

        req.user = decoded;
        next();
    }catch(err){
        next(
            new ApiError(
                401,
                "Invalid or expired token"
            )
        )
    }
}

export default authMiddleware