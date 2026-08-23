import asyncHandler from "../../../utils/asyncHandler.js";
import {
    listUsers,
    updateUser,
    listOrders,
    adjustProductStock,
    uploadProductImages,
    deleteProductImage
} from "./admin.service.js";
import { updateOrderStatus } from "../orders/orders.service.js";

export const listUsersController = asyncHandler(async (req, res) => {
    const users = await listUsers();
    res.status(200).json({
        success: true,
        data: users
    });
});

export const updateUserController = asyncHandler(async (req, res) => {
    const user = await updateUser(req.params.id, req.body);
    res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user
    });
});

export const listOrdersController = asyncHandler(async (req, res) => {
    const orders = await listOrders();
    res.status(200).json({
        success: true,
        data: orders
    });
});

export const updateOrderStatusController = asyncHandler(async (req, res) => {
    const order = await updateOrderStatus(req.params.id, req.body.status);
    res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: order
    });
});

export const adjustProductStockController = asyncHandler(async (req, res) => {
    const { delta } = req.body;
    const product = await adjustProductStock(req.params.id, delta);
    res.status(200).json({
        success: true,
        message: "Product stock adjusted successfully",
        data: product
    });
});

export const uploadProductImagesController = asyncHandler(async (req, res) => {
    const product = await uploadProductImages(req.params.id, req.files);
    res.status(200).json({
        success: true,
        message: "Images uploaded successfully",
        data: product
    });
});

export const deleteProductImageController = asyncHandler(async (req, res) => {
    const product = await deleteProductImage(req.params.id, req.params.imageId);
    res.status(200).json({
        success: true,
        message: "Image deleted successfully",
        data: product
    });
});
