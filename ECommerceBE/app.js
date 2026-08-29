import express from 'express';
import cors from "cors";
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import env from "./src/config/env.js"
import { serveDocs, setupDocs } from "./src/config/swagger.js";

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
import adminRoutes from "./src/api/v1/admin/admin.routes.js"
const app = express();
//step 3
app.use(requestMiddleware);
app.use(loggerMiddleware);
// app.use(globalRateLimiter);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const allowedOrigins = env.CLIENT_URL
  ? env.CLIENT_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // In development or test, allow all origins
    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
      return callback(null, true);
    }
    
    // Allow requests with no origin (like mobile apps, postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    const cleanOrigin = origin.replace(/\/$/, '');
    const localIpRegex = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|[a-zA-Z0-9-]+\.local)(:\d+)?$/;
    
    const isAllowed = 
      allowedOrigins.includes(cleanOrigin) || 
      cleanOrigin.includes('devtunnels.ms') ||
      localIpRegex.test(cleanOrigin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(cookieParser());

app.use(express.json({
  limit: "10kb",
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use("/docs", serveDocs, setupDocs);
app.use("/api/v1/health", healthRoutes)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes)
app.use("/api/v1/cart", cartRoutes)
app.use("/api/v1/checkout", checkoutRoutes)
app.use("/api/v1/orders", orderRoutes)
app.use("/api/v1/payments", paymentRoutes)
app.use("/api/v1/admin", adminRoutes);

app.use(notFoundMiddleware);

app.use(errorMiddleware);












export default app;