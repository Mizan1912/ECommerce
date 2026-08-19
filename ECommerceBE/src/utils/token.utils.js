import jwt  from "jsonwebtoken";
import env from "../config/env.js";
import crypto from "crypto"

export const generateAccessToken=(user)=>{
    return jwt.sign(
        {
            userId:user._id,
            role:user.role,
        },

        env.ACCESS_TOKEN_SECRET,

        {
            expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
        }
    )
}

export const generateRefreshToken = (user)=>{
    return jwt.sign(
        {
            userId:user._id,//payload
        },

        env.REFRESH_TOKEN_SECRET,//secret

        {expiresIn:env.REFRESH_TOKEN_EXPIRES_IN}//expiration
    )
}

export const hashToken = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};