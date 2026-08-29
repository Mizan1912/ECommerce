import mongoose from "mongoose";
import { Readable } from "stream";

import User from "../../../models/User.model.js";
import Order from "../../../models/Order.model.js";
import Product from "../../../models/Product.model.js";
import Payment from "../../../models/Payment.model.js";
import ApiError from "../../../utils/ApiError.js";
import cloudinary from "../../../providers/cloudinary.provider.js";
import { ALLOWED_TRANSITIONS, cancelOrder } from "../orders/orders.service.js";

const LOW_STOCK_THRESHOLD = 5;

const buildPagination = (query) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    return { page, limit, skip: (page - 1) * limit };
};

const paginationMeta = (total, page, limit) => ({
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
});

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* =============================== USERS =============================== */

export const listUsers = async (query = {}) => {
    const { page, limit, skip } = buildPagination(query);
    const filters = {};

    if (query.q) {
        const regex = new RegExp(escapeRegex(query.q), "i");
        filters.$or = [{ name: regex }, { email: regex }];
    }
    if (query.role) filters.role = query.role;
    if (query.isActive !== undefined) filters.isActive = query.isActive === "true";

    const [users, total] = await Promise.all([
        User.find(filters).sort(query.sort || "-createdAt").skip(skip).limit(limit),
        User.countDocuments(filters),
    ]);

    return { users, pagination: paginationMeta(total, page, limit) };
};

export const getUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const [orderCount, spendAgg] = await Promise.all([
        Order.countDocuments({ user: user._id }),
        Order.aggregate([
            { $match: { user: user._id, paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
    ]);

    return {
        user,
        stats: {
            orderCount,
            totalSpent: spendAgg[0]?.total || 0,
        },
    };
};

export const updateUser = async (userId, updateData, actingUserId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const isSelf = actingUserId && user._id.toString() === actingUserId.toString();

    if (updateData.role !== undefined && updateData.role !== user.role) {
        if (isSelf) throw new ApiError(400, "You cannot change your own role");
        if (user.role === "admin" && updateData.role === "customer") {
            const adminCount = await User.countDocuments({ role: "admin", isActive: { $ne: false } });
            if (adminCount <= 1) throw new ApiError(400, "At least one active admin must remain");
        }
        user.role = updateData.role;
    }

    if (updateData.isActive !== undefined && updateData.isActive !== user.isActive) {
        if (isSelf) throw new ApiError(400, "You cannot deactivate your own account");
        if (user.role === "admin" && updateData.isActive === false) {
            const adminCount = await User.countDocuments({ role: "admin", isActive: { $ne: false } });
            if (adminCount <= 1) throw new ApiError(400, "At least one active admin must remain");
        }
        user.isActive = updateData.isActive;
    }

    if (updateData.name !== undefined) user.name = updateData.name;

    await user.save();
    return user;
};

export const deleteUser = async (userId, actingUserId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    if (actingUserId && user._id.toString() === actingUserId.toString()) {
        throw new ApiError(400, "You cannot delete your own account");
    }

    if (user.role === "admin") {
        const adminCount = await User.countDocuments({ role: "admin" });
        if (adminCount <= 1) throw new ApiError(400, "At least one admin must remain");
    }

    const orderCount = await Order.countDocuments({ user: user._id });
    if (orderCount > 0) {
        throw new ApiError(400, "User has orders and cannot be deleted. Deactivate the account instead.");
    }

    await user.deleteOne();
    return { id: userId };
};

/* =============================== ORDERS =============================== */

const orderFilters = (query) => {
    const filters = {};
    if (query.status) filters.status = query.status;
    if (query.paymentStatus) filters.paymentStatus = query.paymentStatus;
    if (query.q) filters.orderNumber = new RegExp(escapeRegex(query.q), "i");
    return filters;
};

export const listOrders = async (query = {}) => {
    const { page, limit, skip } = buildPagination(query);
    const filters = orderFilters(query);

    const [orders, total] = await Promise.all([
        Order.find(filters)
            .populate("user", "name email role")
            .sort(query.sort || "-createdAt")
            .skip(skip)
            .limit(limit),
        Order.countDocuments(filters),
    ]);

    return { orders, pagination: paginationMeta(total, page, limit) };
};

const findOrder = async (idOrNumber) => {
    const conditions = [{ orderNumber: idOrNumber }];
    if (mongoose.Types.ObjectId.isValid(idOrNumber)) conditions.push({ _id: idOrNumber });

    const order = await Order.findOne({ $or: conditions })
        .populate("user", "name email role")
        .populate("items.product", "title slug images");

    if (!order) throw new ApiError(404, "Order not found");
    return order;
};

export const getOrder = async (idOrNumber) => {
    const order = await findOrder(idOrNumber);
    const payments = await Payment.find({ order: order._id }).sort("-createdAt");

    return {
        order,
        payments,
        allowedTransitions: ALLOWED_TRANSITIONS[order.status] || [],
    };
};

export const updateOrderStatus = async (idOrNumber, status) => {
    const order = await findOrder(idOrNumber);

    if (order.status === status) {
        throw new ApiError(400, `Order is already ${status}`);
    }

    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
        throw new ApiError(400, `Cannot move order from ${order.status} to ${status}`);
    }

    // Cancelling restores stock, so delegate to the shared cancel flow.
    if (status === "cancelled") {
        await cancelOrder(order.user?._id || order.user, "admin", order.orderNumber);
        return findOrder(order.orderNumber);
    }

    order.status = status;

    if (status === "paid" && order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        order.paidAt = order.paidAt || new Date();
    }

    if (status === "refunded") {
        order.paymentStatus = "refunded";
        await Payment.updateMany({ order: order._id, status: "paid" }, { $set: { status: "refunded" } });
    }

    await order.save();
    return findOrder(order.orderNumber);
};

/* ============================== PRODUCTS ============================== */

export const listProducts = async (query = {}) => {
    const { page, limit, skip } = buildPagination(query);
    const filters = {};

    if (query.q) {
        const regex = new RegExp(escapeRegex(query.q), "i");
        filters.$or = [{ title: regex }, { slug: regex }, { category: regex }];
    }
    if (query.category) filters.category = query.category.toLowerCase();
    if (query.status === "active") filters.isActive = true;
    if (query.status === "inactive") filters.isActive = false;
    if (query.stock === "low") filters.stock = { $lte: LOW_STOCK_THRESHOLD };
    if (query.stock === "out") filters.stock = 0;

    const [products, total, categories] = await Promise.all([
        Product.find(filters).sort(query.sort || "-createdAt").skip(skip).limit(limit),
        Product.countDocuments(filters),
        Product.distinct("category"),
    ]);

    return { products, categories, pagination: paginationMeta(total, page, limit) };
};

export const getProduct = async (productId) => {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");
    return product;
};

export const createProduct = async (payload) => {
    const existing = await Product.findOne({ title: payload.title });
    if (existing) throw new ApiError(409, "A product with this title already exists");

    return Product.create(payload);
};

export const updateProduct = async (productId, payload) => {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    Object.assign(product, payload);
    await product.save();
    return product;
};

export const deleteProduct = async (productId, { hard = false } = {}) => {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    if (!hard) {
        product.isActive = false;
        await product.save();
        return product;
    }

    const orderCount = await Order.countDocuments({ "items.product": product._id });
    if (orderCount > 0) {
        throw new ApiError(400, "Product appears in existing orders. Deactivate it instead of deleting.");
    }

    for (const image of product.images) {
        if (image.publicId && !image.publicId.startsWith("mock")) {
            try {
                await cloudinary.uploader.destroy(image.publicId);
            } catch (error) {
                console.error("Failed to delete image from Cloudinary:", error.message);
            }
        }
    }

    await product.deleteOne();
    return { id: productId, deleted: true };
};

export const adjustProductStock = async (productId, { delta, stock }) => {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    const nextStock = stock !== undefined ? stock : product.stock + delta;

    if (nextStock < 0) throw new ApiError(400, "Product stock cannot be negative");

    product.stock = nextStock;
    await product.save();
    return product;
};

/* =============================== IMAGES =============================== */

const uploadToCloudinary = (fileBuffer, folder = "products") =>
    new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        Readable.from(fileBuffer).pipe(uploadStream);
    });

export const uploadProductImages = async (productId, files) => {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    if (!files || files.length === 0) throw new ApiError(400, "No files uploaded");

    for (const file of files) {
        try {
            const result = await uploadToCloudinary(file.buffer);
            product.images.push({
                url: result.secure_url,
                publicId: result.public_id,
                isPrimary: product.images.length === 0,
            });
        } catch (error) {
            console.error("Cloudinary upload failed:", error);
            throw new ApiError(500, "Failed to upload image to Cloudinary");
        }
    }

    await product.save();
    return product;
};

export const deleteProductImage = async (productId, imageId) => {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    const imageIndex = product.images.findIndex(
        (img) => img._id?.toString() === imageId || img.publicId === imageId
    );
    if (imageIndex === -1) throw new ApiError(404, "Image not found on product");

    const image = product.images[imageIndex];
    const wasPrimary = image.isPrimary;

    try {
        if (image.publicId && !image.publicId.startsWith("mock")) {
            await cloudinary.uploader.destroy(image.publicId);
        }
    } catch (error) {
        console.error("Failed to delete from Cloudinary:", error.message);
        // Still drop the reference from the product.
    }

    product.images.splice(imageIndex, 1);

    if (wasPrimary && product.images.length > 0) {
        product.images[0].isPrimary = true;
    }

    await product.save();
    return product;
};

export const setPrimaryProductImage = async (productId, imageId) => {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    const target = product.images.find(
        (img) => img._id?.toString() === imageId || img.publicId === imageId
    );
    if (!target) throw new ApiError(404, "Image not found on product");

    product.images.forEach((img) => {
        img.isPrimary = img === target;
    });

    await product.save();
    return product;
};

/* ============================== PAYMENTS ============================== */

export const listPayments = async (query = {}) => {
    const { page, limit, skip } = buildPagination(query);
    const filters = {};

    if (query.status) filters.status = query.status;
    if (query.provider) filters.provider = query.provider;

    if (query.q) {
        const regex = new RegExp(escapeRegex(query.q), "i");
        const orders = await Order.find({ orderNumber: regex }).select("_id");
        filters.$or = [
            { providerOrderId: regex },
            { providerPaymentId: regex },
            { order: { $in: orders.map((o) => o._id) } },
        ];
    }

    const [payments, total] = await Promise.all([
        Payment.find(filters)
            .populate({
                path: "order",
                select: "orderNumber status paymentStatus totalAmount user",
                populate: { path: "user", select: "name email" },
            })
            .sort(query.sort || "-createdAt")
            .skip(skip)
            .limit(limit),
        Payment.countDocuments(filters),
    ]);

    return { payments, pagination: paginationMeta(total, page, limit) };
};

/* ============================= DASHBOARD ============================= */

export const getDashboardStats = async () => {
    const now = new Date();
    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
        totalUsers,
        newUsers,
        totalProducts,
        activeProducts,
        lowStockProducts,
        outOfStockCount,
        totalOrders,
        ordersByStatus,
        revenueAgg,
        revenue30Agg,
        recentOrders,
        salesTrend,
        topProducts,
        paymentsByStatus,
    ] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ createdAt: { $gte: last30 } }),
        Product.countDocuments({}),
        Product.countDocuments({ isActive: true }),
        Product.find({ stock: { $lte: LOW_STOCK_THRESHOLD } })
            .sort("stock")
            .limit(10)
            .select("title slug stock price isActive"),
        Product.countDocuments({ stock: 0 }),
        Order.countDocuments({}),
        Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        Order.aggregate([
            { $match: { paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
        ]),
        Order.aggregate([
            { $match: { paymentStatus: "paid", createdAt: { $gte: last30 } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
        ]),
        Order.find({}).populate("user", "name email").sort("-createdAt").limit(8),
        Order.aggregate([
            { $match: { createdAt: { $gte: last30 } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    orders: { $sum: 1 },
                    revenue: {
                        $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0] },
                    },
                },
            },
            { $sort: { _id: 1 } },
        ]),
        Order.aggregate([
            { $match: { paymentStatus: "paid" } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    title: { $first: "$items.title" },
                    quantity: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                },
            },
            { $sort: { quantity: -1 } },
            { $limit: 5 },
        ]),
        Payment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" } } }]),
    ]);

    const statusMap = ordersByStatus.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {});

    return {
        users: { total: totalUsers, newLast30Days: newUsers },
        products: {
            total: totalProducts,
            active: activeProducts,
            inactive: totalProducts - activeProducts,
            outOfStock: outOfStockCount,
            lowStockThreshold: LOW_STOCK_THRESHOLD,
            lowStock: lowStockProducts,
        },
        orders: {
            total: totalOrders,
            byStatus: statusMap,
            pending: statusMap.pending || 0,
            awaitingFulfillment: (statusMap.paid || 0) + (statusMap.processing || 0),
        },
        revenue: {
            total: revenueAgg[0]?.total || 0,
            paidOrders: revenueAgg[0]?.count || 0,
            last30Days: revenue30Agg[0]?.total || 0,
            averageOrderValue: revenueAgg[0]?.count
                ? Math.round(revenueAgg[0].total / revenueAgg[0].count)
                : 0,
        },
        payments: paymentsByStatus.reduce(
            (acc, row) => ({ ...acc, [row._id]: { count: row.count, amount: row.amount } }),
            {}
        ),
        salesTrend,
        topProducts,
        recentOrders,
    };
};
