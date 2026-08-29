import { success } from "zod";
import asyncHandler from "../../../utils/asyncHandler.js";
import { registerUser } from "./auth.service.js";

import { loginUser , refreshUserToken, logoutUser, forgotPassword} from "./auth.service.js";
import { getProducts } from "../products/products.service.js";
export const register = asyncHandler(
    async (req,res) => {
        const user = await registerUser(req.validatedData.body);

        res.status(201).json({
            success:true,

            message:"User registered successfully",

            data:{
                user,
            }
        })
    }
)

export const login = asyncHandler(
  async (req, res) => {
    const result = await loginUser(
      req.validatedData.body
    );

    res.cookie(
      "refreshToken",

      result.refreshToken,

      {
        httpOnly: true,

        secure: false,

        sameSite: "strict",

        maxAge:
          7 *
          24 *
          60 *
          60 *
          1000,
      }
    );

    res.status(200).json({
      success: true,

      message: "Login successful",

      data: {
        user: result.user,

        accessToken:
          result.accessToken,
      },
    });
  }
);


export const refresh = asyncHandler(
  async (req,res) => {
    const refreshToken = req.cookies.refreshToken;

    const tokens = await refreshUserToken(refreshToken);

    res.cookie(
      "refreshToken",
      tokens.refreshToken,
      {
        httpOnly: true,

        secure: false,

        sameSite: "strict",

        maxAge:
          7 *
          24 *
          60 *
          60 *
          1000,
      }
    );
    
    res.status(200).json({
      success: true,
      message:"Token refreshed",
      data:{
        accessToken:tokens.accessToken,
      }
    })
  }
)

export const logout = asyncHandler(
  async (req,res) => {
    const refreshToken = req.cookies.refreshToken;

    await logoutUser(refreshToken);

    res.clearCookie(
      "refreshToken"
    );

    res.status(200).json({
      success:true,
      message:"Logged out successfuly"
    })
  }
)

export const forgotPasswordController =
  asyncHandler(
    async (req, res) => {
      await forgotPassword(
        req.validatedData.body.email
      );

      res.status(200).json({
        success: true,

        message:
          "If account exists, reset mail sent",
      });
    }
  );
