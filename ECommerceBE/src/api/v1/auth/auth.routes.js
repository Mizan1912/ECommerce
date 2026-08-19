import express from "express";
import validate from "../../../middlewares/validation.middleware.js";

import { registerSchema , loginSchema, refreshSchema, forgotPasswordSchema} from "./auth.validator.js";
import { register, login, refresh, logout, forgotPasswordController } from "./auth.controller.js";

const router=express.Router();


router.post(
    "/register",
    validate(registerSchema),
    register
);
router.post(
    "/login",
    validate(loginSchema),
    login
);
router.post(
    "/refresh",
    validate(refreshSchema),
    refresh
);
router.post(
    "/logout",
    logout
);
router.post(
    "/forgot-password",
    validate(forgotPasswordSchema),
    forgotPasswordController
)
export default router;