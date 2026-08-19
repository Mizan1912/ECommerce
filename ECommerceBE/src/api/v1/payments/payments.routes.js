import express
from "express";

import authMiddleware
from "../../../middlewares/auth.middleware.js";

import validate
from "../../../middlewares/validation.middleware.js";

import {
  initiatePaymentSchema,
} from "./payments.validator.js";

import {
  initiatePaymentController,
  webhookController,
} from "./payments.controller.js";

const router =
  express.Router();

router.post(
  "/:orderNumber",

  authMiddleware,

  validate(
    initiatePaymentSchema
  ),

  initiatePaymentController
);

router.post(
  "/webhook",

   webhookController
);

export default router;