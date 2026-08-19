import express from "express";
import validate from "../../../middlewares/validation.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import requireRole from "../../../middlewares/role.middleware.js"
import { createProductSchema, getProductBySlugSchema, getProductSchema, updateProductSchema } from "./products.validator.js";
import { createProductController, deactivateProductController, getProductBySlugController, getProductsController, updateProductController } from "./products.controller.js";


const router = express.Router();

router.get("/",
     authMiddleware,
     // requireRole("admin"),
     validate(getProductSchema),
     getProductsController,
)

router.get("/:slug",
     authMiddleware,
     // requireRole("admin"),
     validate(getProductBySlugSchema),
     getProductBySlugController,
)

router.post("/",
     authMiddleware,
     requireRole("admin"),
     validate(createProductSchema),
     createProductController,
)

router.patch("/:slug",
     authMiddleware,
     requireRole("admin"),
     validate(updateProductSchema),
     updateProductController
)

router.delete("/:slug",
     authMiddleware,
     requireRole("admin"),
     validate(getProductBySlugSchema),
     deactivateProductController
)





export default router;