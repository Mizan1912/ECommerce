import express from "express";

import authMiddleware
from "../../../middlewares/auth.middleware.js";

import validate from "../../../middlewares/validation.middleware.js"

import {
  getMyOrdersController,

  getOrderDetailsController,
  updateOrderStatusController,
  cancelOrderController,
}
from "./orders.controller.js";
import requireRole from "../../../middlewares/role.middleware.js";
import { updateOrderStatusSchema, cancelOrderSchema } from "./orders.validator.js";

const router =
  express.Router();


  router.get(
  "/",

  authMiddleware,

  getMyOrdersController
);

router.get(
  "/:orderNumber",

  authMiddleware,

  getOrderDetailsController
);

router.patch(
  "/:orderNumber/status",

  authMiddleware,

  requireRole("admin"),

  validate(
    updateOrderStatusSchema
  ),

  updateOrderStatusController
);

router.post(
  "/:orderNumber/cancel",

  authMiddleware,

  validate(
    cancelOrderSchema
  ),

  cancelOrderController
);

export default router;