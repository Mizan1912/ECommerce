import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const paginationQuery = {
    page: z.string().optional(),
    limit: z.string().optional(),
    q: z.string().optional(),
    sort: z.string().optional(),
};

/* ---------------------------------- users --------------------------------- */

export const listUsersSchema = z.object({
    query: z.object({
        ...paginationQuery,
        role: z.enum(["customer", "admin"]).optional(),
        isActive: z.enum(["true", "false"]).optional(),
    }),
});

export const getUserSchema = z.object({
    params: z.object({ id: objectId }),
});

export const updateUserSchema = z.object({
    params: z.object({ id: objectId }),
    body: z
        .object({
            name: z.string().min(2).optional(),
            role: z.enum(["customer", "admin"]).optional(),
            isActive: z.boolean().optional(),
        })
        .refine((body) => Object.keys(body).length > 0, {
            message: "At least one field is required",
        }),
});

export const deleteUserSchema = getUserSchema;

/* --------------------------------- orders --------------------------------- */

export const listOrdersSchema = z.object({
    query: z.object({
        ...paginationQuery,
        status: z
            .enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"])
            .optional(),
        paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
    }),
});

export const getOrderSchema = z.object({
    params: z.object({ id: z.string().min(1) }),
});

export const adminUpdateOrderStatusSchema = z.object({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({
        status: z.enum(["paid", "processing", "shipped", "delivered", "cancelled", "refunded"]),
    }),
});

/* -------------------------------- products -------------------------------- */

export const listProductsSchema = z.object({
    query: z.object({
        ...paginationQuery,
        category: z.string().optional(),
        status: z.enum(["active", "inactive", "all"]).optional(),
        stock: z.enum(["low", "out"]).optional(),
    }),
});

export const getProductSchema = z.object({
    params: z.object({ id: objectId }),
});

export const createProductSchema = z.object({
    body: z.object({
        title: z.string().min(3),
        description: z.string().min(10),
        category: z.string().min(2),
        price: z.number().nonnegative(),
        stock: z.number().int().nonnegative(),
        isActive: z.boolean().optional(),
    }),
});

export const updateProductSchema = z.object({
    params: z.object({ id: objectId }),
    body: z
        .object({
            title: z.string().min(3).optional(),
            description: z.string().min(10).optional(),
            category: z.string().min(2).optional(),
            price: z.number().nonnegative().optional(),
            stock: z.number().int().nonnegative().optional(),
            isActive: z.boolean().optional(),
        })
        .refine((body) => Object.keys(body).length > 0, {
            message: "At least one field is required",
        }),
});

export const deleteProductSchema = z.object({
    params: z.object({ id: objectId }),
    query: z.object({
        hard: z.enum(["true", "false"]).optional(),
    }),
});

export const adjustProductStockSchema = z.object({
    params: z.object({ id: objectId }),
    body: z
        .object({
            delta: z.number().int().optional(),
            stock: z.number().int().nonnegative().optional(),
        })
        .refine((body) => body.delta !== undefined || body.stock !== undefined, {
            message: "Provide either 'delta' or 'stock'",
        }),
});

export const productImagesSchema = z.object({
    params: z.object({ id: objectId }),
});

export const productImageSchema = z.object({
    params: z.object({
        id: objectId,
        imageId: z.string().min(1),
    }),
});

/* -------------------------------- payments -------------------------------- */

export const listPaymentsSchema = z.object({
    query: z.object({
        ...paginationQuery,
        status: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
        provider: z.string().optional(),
    }),
});
