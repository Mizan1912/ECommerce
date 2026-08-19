import express from "express";

import authMiddleware
from "../../../middlewares/auth.middleware.js";

import validate from "../../../middlewares/validation.middleware.js"

import {
  getMyOrdersController,

  getOrderDetailsController,
  updateOrderStatusController,
}
from "./orders.controller.js";
import requireRole from "../../../middlewares/role.middleware.js";
import { updateOrderStatusSchema } from "./orders.validator.js";

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

export default router;