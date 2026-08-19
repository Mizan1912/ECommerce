import express from "express";

import authMiddleware
from "../../../middlewares/auth.middleware.js";

import validate
from "../../../middlewares/validate.middleware.js";

import {
  checkoutSchema,
} from "./checkout.validator.js";

import {
  checkoutController,
} from "./checkout.controller.js";

const router = express.Router();

router.post(
  "/",

  authMiddleware,

  validate(
    checkoutSchema
  ),

  checkoutController
);

export default router;