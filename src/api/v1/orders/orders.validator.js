import { z } from "zod";

export const updateOrderStatusSchema =
  z.object({
    params: z.object({
      orderNumber:
        z.string(),
    }),

    body: z.object({
      status:
        z.enum([
          "paid",

          "processing",

          "shipped",

          "delivered",

          "cancelled",

          "refunded",
        ]),
    }),
  });