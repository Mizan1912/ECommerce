import { z } from "zod";

export const updateUserSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: z.object({
        role: z.enum(["customer", "admin"]).optional(),
    }),
});

export const adjustProductStockSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: z.object({
        delta: z.number().int(),
    }),
});
