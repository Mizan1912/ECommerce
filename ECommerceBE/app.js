import express from 'express';
import cors from "cors";
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import env from "./src/config/env.js"

import healthRoutes from "./src/api/v1/health/health.routes.js";

import notFoundMiddleware from './src/middlewares/notFound.middleware.js';
import errorMiddleware from "./src/middlewares/error.middleware.js"
import requestMiddleware from './src/middlewares/requestId.middleware.js';
import loggerMiddleware from './src/middlewares/logger.middleware.js';
import globalRateLimiter from './src/middlewares/rateLimit.middleware.js';

import authRoutes from "./src/api/v1/auth/auth.routes.js"
import productRoutes from "./src/api/v1/products/products.routes.js"
import cartRoutes from "./src/api/v1/cart/cart.routes.js"
import checkoutRoutes from "./src/api/v1/checkout/checkout.routes.js"
import orderRoutes from "./src/api/v1/orders/orders.routes.js"
import paymentRoutes from "./src/api/v1/payments/payments.routes.js"
const app = express();
//step 3
app.use(requestMiddleware);
app.use(loggerMiddleware);
app.use(globalRateLimiter);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(cors({
    origin:env.CLIENT_URL,
    credentials:true
}))

app.use(cookieParser());

app.use(express.json({
    limit:"10kb",
}));

app.use("/api/v1/health",healthRoutes)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products",productRoutes)
app.use("/api/v1/cart",cartRoutes)
app.use("/api/v1/checkout",checkoutRoutes)
app.use("/api/v1/orders",orderRoutes)
app.use("/api/v1/payments",paymentRoutes)

app.use(notFoundMiddleware);

app.use(errorMiddleware);












export default app;