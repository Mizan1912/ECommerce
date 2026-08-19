import { z } from "zod";

export const initiatePaymentSchema =
  z.object({
    params: z.object({
      orderNumber:
        z.string().min(1),
    }),
  });