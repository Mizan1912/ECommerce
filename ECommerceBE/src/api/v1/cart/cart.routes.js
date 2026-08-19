import express from "express"
import authMiddleware from "../../../middlewares/auth.middleware.js";
import validate from "../../../middlewares/validation.middleware.js";
import {addToCartSchema} from "./cart.validator.js";
import { addToCartController, getCartController } from "./cart.controller.js";
import {
  updateCartItemSchema,
  removeCartItemSchema,
} from "./cart.validator.js";
import {
  updateCartItemController,
  removeCartItemController,
  clearCartController,
} from "./cart.controller.js";

const router = express.Router();


router.get("/",
    authMiddleware,
    getCartController
)

router.post("/",
    authMiddleware,
    validate(addToCartSchema),
    addToCartController
)

router.patch(
  "/:productId",

  authMiddleware,

  validate(
    updateCartItemSchema
  ),

  updateCartItemController
);

router.delete(
  "/:productId",

  authMiddleware,

  validate(
    removeCartItemSchema
  ),

  removeCartItemController
);

router.delete(
  "/",

  authMiddleware,

  clearCartController
);


export default router;