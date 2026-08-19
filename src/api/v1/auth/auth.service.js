import bcrypt from "bcrypt"
import User from "../../../models/User.model.js";
import ApiError from "../../../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {
    generateAccessToken,
    generateRefreshToken,
    hashToken
} from "../../../utils/token.utils.js"
import RefreshToken from "../../../models/RefreshToken.model.js";
import crypto from "crypto";
import sendMail from "../../../utils/sendMail.js";
import { env } from "process";

export const registerUser = async (payload) => {
    const {
        name,
        email,
        password
    } = payload;

    const existingUser = await User.findOne({email});

    if (existingUser) {
        throw new ApiError(
            409,
            "User already exists"
        );
        
    } 

    const hashedPassword = await bcrypt.hash(password,12);

    const createdUser = await User.create({
        name,
        email,
        password:hashedPassword
    })

    const user = await User.findOne({email})
    return user;
}

export const loginUser = async(payload)=>{
    const {email,password}=payload;

    const user = await User.findOne({email}).select("+password");

    if(!user){
        throw new ApiError(401,
            "Invalid Credentials"
        );   
    }

    const isPasswordCorrect=await bcrypt.compare(password,user.password);

    if(!isPasswordCorrect){
        throw new ApiError(401,
            "Invalid Credentials"
        )
    }

    const accessToken =
        generateAccessToken(user);

    const refreshToken =
        generateRefreshToken(user);

    await RefreshToken.create({
        user:user._id,
        token: hashToken(refreshToken),

        expiresAt:new Date(
            Date.now()+7*24*60*60*1000
        )
    })   
    
    user.password=undefined

    return {
        user,
        accessToken,
        refreshToken
    }
}

export const refreshUserToken =async(refreshToken) =>{
    if(!refreshToken){
        throw new ApiError(
            401,
            "Refresh token missing"
        );
    }

    let decoded;

    try {
        decoded = jwt.verify(
            refreshToken,
            env.REFRESH_TOKEN_SECRET
        );
    } catch (error) {
        throw new ApiError(
            401,
            "Invalid refresh token"
        )
    }

    const hashedToken = hashToken(refreshToken);

    const existingtoken = await RefreshToken.findOne({
        token:hashedToken,
    })

    if(!existingtoken){
        throw new ApiError(
            401,
            "Refresh token revoked"
        )
    }
    

    const user = await User.findById(
        decoded.userId
    )
    

    if(!user){
        throw new ApiError(
            401,
            "User not found"
        );
    }

    await RefreshToken.deleteOne({
        _id:existingtoken._id
    });

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await RefreshToken.create({
        user:user._id,
        token:hashToken(newRefreshToken),
        expiresAt: new Date(
            Date.now() + 7*24*60*60*1000
        )
    })

    return{
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    }


}

export const logoutUser = async (
  refreshToken
) => {
  if (!refreshToken) {
    return;
  }

  const hashedToken =
    hashToken(refreshToken);

  await RefreshToken.deleteOne({
    token: hashedToken,
  });
};

export const forgotPassword = async (email) => {
    const user =await User.findOne({email});

    if(!user){
        return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedResetToken = hashToken(resetToken);

    user.passwordResetToken = hashedResetToken;

    user.passwordResetExpires = Date.now()+15*60*1000;

    await user.save();

    const resetURL = `http://localhost:5173/reset-password?token=${resetToken}`;

    await sendMail({
        to: user.email,
        subject: "Password Reset",
        html: `
        <h1>Password Reset</h1>

        <a href="${resetURL}">
            Reset Password
        </a>
        `,
    })
}

