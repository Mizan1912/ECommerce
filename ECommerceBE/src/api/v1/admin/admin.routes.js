import express from 'express';
import authMiddleware from '../../../middlewares/auth.middleware.js';
import requireRole from '../../../middlewares/role.middleware.js';
import validate from '../../../middlewares/validation.middleware.js';
import upload, { validateImageSignature } from '../../../middlewares/upload.middleware.js';

import {
    getStatsController,
    listUsersController,
    getUserController,
    updateUserController,
    deleteUserController,
    listOrdersController,
    getOrderController,
    updateOrderStatusController,
    listProductsController,
    getProductController,
    createProductController,
    updateProductController,
    deleteProductController,
    adjustProductStockController,
    uploadProductImagesController,
    deleteProductImageController,
    setPrimaryProductImageController,
    listPaymentsController,
} from './admin.controller.js';

import {
    listUsersSchema,
    getUserSchema,
    updateUserSchema,
    deleteUserSchema,
    listOrdersSchema,
    getOrderSchema,
    adminUpdateOrderStatusSchema,
    listProductsSchema,
    getProductSchema,
    createProductSchema,
    updateProductSchema,
    deleteProductSchema,
    adjustProductStockSchema,
    productImagesSchema,
    productImageSchema,
    listPaymentsSchema,
} from './admin.validator.js';

const router = express.Router();

// Every admin route requires an authenticated user holding the 'admin' role.
router.use(authMiddleware);
router.use(requireRole('admin'));

// Dashboard
router.get('/stats', getStatsController);

// Users
router.get('/users', validate(listUsersSchema), listUsersController);
router.get('/users/:id', validate(getUserSchema), getUserController);
router.patch('/users/:id', validate(updateUserSchema), updateUserController);
router.delete('/users/:id', validate(deleteUserSchema), deleteUserController);

// Orders
router.get('/orders', validate(listOrdersSchema), listOrdersController);
router.get('/orders/:id', validate(getOrderSchema), getOrderController);
router.patch('/orders/:id/status', validate(adminUpdateOrderStatusSchema), updateOrderStatusController);

// Products
router.get('/products', validate(listProductsSchema), listProductsController);
router.post('/products', validate(createProductSchema), createProductController);
router.get('/products/:id', validate(getProductSchema), getProductController);
router.patch('/products/:id', validate(updateProductSchema), updateProductController);
router.delete('/products/:id', validate(deleteProductSchema), deleteProductController);

// Inventory
router.patch('/products/:id/stock', validate(adjustProductStockSchema), adjustProductStockController);

// Product images
router.post(
    '/products/:id/images',
    upload.array('images', 5),
    validateImageSignature,
    validate(productImagesSchema),
    uploadProductImagesController
);
router.delete('/products/:id/images/:imageId', validate(productImageSchema), deleteProductImageController);
router.patch(
    '/products/:id/images/:imageId/primary',
    validate(productImageSchema),
    setPrimaryProductImageController
);

// Payments
router.get('/payments', validate(listPaymentsSchema), listPaymentsController);

export default router;
