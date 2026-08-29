import express from 'express';
import authMiddleware from '../../../middlewares/auth.middleware.js';
import requireRole from '../../../middlewares/role.middleware.js';
import validate from '../../../middlewares/validation.middleware.js';
import upload, { validateImageSignature } from '../../../middlewares/upload.middleware.js';

import {
    listUsersController,
    updateUserController,
    listOrdersController,
    updateOrderStatusController,
    adjustProductStockController,
    uploadProductImagesController,
    deleteProductImageController
} from './admin.controller.js';

import {
    updateUserSchema,
    adjustProductStockSchema
} from './admin.validator.js';

import { updateOrderStatusSchema } from '../orders/orders.validator.js';

const router = express.Router();

// All routes here require the user to be authenticated and have the 'admin' role
router.use(authMiddleware);
router.use(requireRole('admin'));

// Admin User Management
router.get('/users', listUsersController);
router.patch('/users/:id', validate(updateUserSchema), updateUserController);

// Admin Order Management
router.get('/orders', listOrdersController);
router.patch('/orders/:id/status', validate(updateOrderStatusSchema), updateOrderStatusController);

// Admin Product Stock & Image Management
router.patch('/products/:id/stock', validate(adjustProductStockSchema), adjustProductStockController);
router.post('/products/:id/images', upload.array('images', 5), validateImageSignature, uploadProductImagesController);
router.delete('/products/:id/images/:imageId', deleteProductImageController);

export default router;
