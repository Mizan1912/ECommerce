import asyncHandler from "../../../utils/asyncHandler.js";
import * as adminService from "./admin.service.js";

const ok = (res, data, message, meta) =>
    res.status(200).json({
        success: true,
        ...(message ? { message } : {}),
        data,
        ...(meta ? { meta } : {}),
    });

/* ============================= DASHBOARD ============================= */

export const getStatsController = asyncHandler(async (req, res) => {
    const stats = await adminService.getDashboardStats();
    ok(res, stats);
});

/* =============================== USERS =============================== */

export const listUsersController = asyncHandler(async (req, res) => {
    const { users, pagination } = await adminService.listUsers(req.query);
    ok(res, users, undefined, { pagination });
});

export const getUserController = asyncHandler(async (req, res) => {
    const result = await adminService.getUser(req.params.id);
    ok(res, result);
});

export const updateUserController = asyncHandler(async (req, res) => {
    const user = await adminService.updateUser(req.params.id, req.body, req.user?.userId);
    ok(res, user, "User updated successfully");
});

export const deleteUserController = asyncHandler(async (req, res) => {
    const result = await adminService.deleteUser(req.params.id, req.user?.userId);
    ok(res, result, "User deleted successfully");
});

/* =============================== ORDERS =============================== */

export const listOrdersController = asyncHandler(async (req, res) => {
    const { orders, pagination } = await adminService.listOrders(req.query);
    ok(res, orders, undefined, { pagination });
});

export const getOrderController = asyncHandler(async (req, res) => {
    const result = await adminService.getOrder(req.params.id);
    ok(res, result);
});

export const updateOrderStatusController = asyncHandler(async (req, res) => {
    const order = await adminService.updateOrderStatus(req.params.id, req.body.status);
    ok(res, order, "Order status updated successfully");
});

/* ============================== PRODUCTS ============================== */

export const listProductsController = asyncHandler(async (req, res) => {
    const { products, categories, pagination } = await adminService.listProducts(req.query);
    ok(res, products, undefined, { pagination, categories });
});

export const getProductController = asyncHandler(async (req, res) => {
    const product = await adminService.getProduct(req.params.id);
    ok(res, product);
});

export const createProductController = asyncHandler(async (req, res) => {
    const product = await adminService.createProduct(req.body);
    res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
    });
});

export const updateProductController = asyncHandler(async (req, res) => {
    const product = await adminService.updateProduct(req.params.id, req.body);
    ok(res, product, "Product updated successfully");
});

export const deleteProductController = asyncHandler(async (req, res) => {
    const hard = req.query.hard === "true";
    const result = await adminService.deleteProduct(req.params.id, { hard });
    ok(res, result, hard ? "Product deleted permanently" : "Product deactivated successfully");
});

export const adjustProductStockController = asyncHandler(async (req, res) => {
    const { delta, stock } = req.body;
    const product = await adminService.adjustProductStock(req.params.id, { delta, stock });
    ok(res, product, "Product stock updated successfully");
});

/* =============================== IMAGES =============================== */

export const uploadProductImagesController = asyncHandler(async (req, res) => {
    const product = await adminService.uploadProductImages(req.params.id, req.files);
    ok(res, product, "Images uploaded successfully");
});

export const deleteProductImageController = asyncHandler(async (req, res) => {
    const product = await adminService.deleteProductImage(req.params.id, req.params.imageId);
    ok(res, product, "Image deleted successfully");
});

export const setPrimaryProductImageController = asyncHandler(async (req, res) => {
    const product = await adminService.setPrimaryProductImage(req.params.id, req.params.imageId);
    ok(res, product, "Primary image updated successfully");
});

/* ============================== PAYMENTS ============================== */

export const listPaymentsController = asyncHandler(async (req, res) => {
    const { payments, pagination } = await adminService.listPayments(req.query);
    ok(res, payments, undefined, { pagination });
});
