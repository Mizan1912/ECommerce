import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        email:z.email(),
        password: z.string().min(8),
    })
})
export const loginSchema = z.object({
    body: z.object({
        email:z.email(),
        password: z.string(),
    })
})

export const refreshSchema = z.object({
  body: z.object({}),
});

export const forgotPasswordSchema =
  z.object({
    body: z.object({
      email: z.email(),
    }),
  });