# E-Commerce Backend — Complete Architectural & Request Flow Guide

This guide describes the complete, end-to-end architectural flow of the completed E-Commerce REST API backend. It explains the request lifecycle, data consistency models, security boundaries, and payment integration.

---

## 1. System Architecture Overview

The backend is built as a **Modular Monolith** with a **Layered Architecture** applied per feature block. 

```
HTTP Request 
    ↓
Middlewares (Request ID → Logging → Security Headers → Rate Limiter)
    ↓
Routing Layer (Express Router)
    ↓
Validation Middleware (Zod parsing & body/query sanitation)
    ↓
Controller (Parses request parameters, invokes service, prepares HTTP envelope)
    ↓
Service Layer (Owns business logic, starts sessions, manages ACID boundaries)
    ↓
Database Models (Mongoose Schemas & Query definitions)
```

### Key Architectural Guidelines
- **No Direct DB Calls in Controllers**: All database lookups and updates are delegated to service files to maintain clean separation of concerns.
- **Trusted Pricing**: Unit prices and calculations are always snapshotted from the database (`Product` collection) at checkout, ignoring user-submitted totals to prevent tampering.
- **Integer Minor Units**: Monetary fields (prices, totals, fees) are stored as integer minor units (paise/cents) to prevent floating-point rounding errors.

---

## 2. Global Request Lifecycle & Middleware Stack

Every HTTP request sent to the API passes through a series of global middlewares registered in order in [`app.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/app.js):

1.  **Request ID (`requestId.middleware.js`)**: Injects a unique UUID in `req.id` and assigns the `X-Request-Id` response header for trace mapping.
2.  **Request Logger (`logger.middleware.js`)**: Leverages `pino-http` to log incoming methods, URLs, headers, and performance latency.
3.  **Rate Limiting (`rateLimit.middleware.js`)**: Uses `express-rate-limit` to prevent brute-force attacks by limiting requests per IP window.
4.  **Security Headers (`helmet`)**: Sets HTTP response headers (XSS filters, Content Security Policy, frame options) to protect client browsers.
5.  **CORS**: Configures cross-origin allowances with origins whitelisted from the environment variables, permitting credentials (`httpOnly` cookies).
6.  **Cookie Parser (`cookie-parser`)**: Extracts cookies from headers, making the rotatable refresh tokens accessible.
7.  **JSON Parser (`express.json`)**: Configured with a `verify` callback to capture the raw incoming payload string in `req.rawBody` for webhook verification.

---

## 3. User Authentication & Session Rotation Flow

We implement a secure **Access Token + Rotatable Refresh Token** flow:

```
Register/Login → JWT Access Token (Auth Bearer, exp 15m) + Opaque Refresh Token (httpOnly Cookie, exp 7d)
                                 ↓
                            Request Route
                                 ↓
            Expires? ──── yes ──→ POST /auth/refresh 
                                 ↓
                         Verify refresh token 
                                 ↓
                  Is rotated? ── yes ──→ Issue new Access Token & Rotate Cookie
                  Is reused?  ── yes ──→ REJECT & Invalidate token family (security breach)
```

### Detail Flow
1.  **Registration (`POST /api/v1/auth/register`)**:
    *   Checks if the email already exists in the `User` database.
    *   Hashes the plain password using `bcrypt` with a cost factor of `12`.
    *   Stores the user and returns the serialized user document (excluding password fields).
2.  **Login (`POST /api/v1/auth/login`)**:
    *   Retrieves the user (explicitly selecting the password hash).
    *   Compares hashes via `bcrypt.compare`.
    *   Generates a short-lived JWT Access Token (`15m` expiry) containing the user ID and role.
    *   Generates a rotatable, long-lived Refresh Token stored in the `RefreshToken` collection, set on a `httpOnly`, `secure`, `sameSite` cookie.
3.  **Token Refreshing (`POST /api/v1/auth/refresh`)**:
    *   Reads the refresh token cookie.
    *   Decrypts or hashes and matches it in the database.
    *   Performs **Token Rotation**: deletes the used refresh token, generates a brand new refresh token, and sets the updated cookie.
    *   Performs **Theft Detection**: If a reused refresh token is presented, the database assumes the key was intercepted. It immediately revokes the entire token family (family ID), forcing a full logout.

---

## 4. Cart Operations & Stock Verification

The shopping cart resides in the database to allow cross-device sync:

1.  **Add Item (`POST /api/v1/cart`)**:
    *   Validates product existence and that `isActive = true`.
    *   Checks that requested quantity does not exceed the current product stock.
    *   Pushes an object containing `product`, `quantity`, and `priceSnapshot` (current price at addition) to the cart array.
2.  **Read Cart (`GET /api/v1/cart`)**:
    *   Retrieves the cart document, populating product fields.
    *   Re-evaluates subtotals based on snapshotted prices.
3.  **Update Quantity (`PATCH /api/v1/cart/:productId`)**:
    *   Validates new quantity against database stock levels.
    *   Updates the embedded cart array item.

---

## 5. Checkout, Idempotency Keys, and Mongoose Sessions

Placing an order requires checking stock, reserving inventory, creating documents, and clearing carts.

```
POST /api/v1/checkout (with Idempotency-Key header)
         ↓
Generate SHA-256 hash of body
         ↓
Check Idempotency DB:
  - If state = 'in-flight'  ──→ Return 409 Conflict
  - If state = 'completed'  ──→ Replay stored response status + payload
  - Mismatched body hash   ──→ Return 422 Unprocessable Entity
         ↓
Create 'in-flight' lock in database
         ↓
Get Transaction Session (from db.utils.js)
         ↓
Verify stock levels conditionally: Product.updateOne({ stock >= quantity })
         ↓
Snapshot product prices, create Order (status: 'pending') and Payment records
         ↓
Clear cart items & commit transaction session
         ↓
Intercept res.send: Update Idempotency state to 'completed', cache payload, return response
```

- **Stock Reservation**: Inventory decrement uses conditional MongoDB updates (`Product.updateOne({ _id, stock: { $gte: quantity } }, { $inc: { stock: -quantity } })`). If `modifiedCount` is `0`, a `400 Insufficient Stock` error is thrown, rolling back any transaction changes.
- **Idempotency Locking**: The system blocks concurrent double-clicks by maintaining a state in the `Idempotency` collection. If the connection drops midway, the lock is released or cleaned up by a TTL index.

---

## 6. Payment Webhooks & Inventory Reconciliation

We interface with payment processors asynchronously:

```
Razorpay Webhook POST /api/v1/payments/webhook
                   ↓
Verify HMAC signature using req.rawBody and webhook secret
                   ↓
Verify event ID is not processed (ProcessedEvent DB check)
                   ↓
Choose Event Action:
  - payment.captured ──→ updatePaymentStatus('paid') ──→ Set Order paymentStatus = 'paid'
  - payment.failed   ──→ updatePaymentStatus('failed') ──→ Set Order status = 'cancelled'
                                                        ↓
                                              Restore inventory stock
                   ↓
Record Event ID in ProcessedEvent DB to block duplicate retries
```

- **Stock Restoration**: When a webhook signals `payment.failed`, or when an order is manually cancelled, a database transaction is opened. It loops over the order line items and increments the `Product.stock` back by the ordered quantities.

---

## 7. Media Upload Pipeline

Admin upload flow streams files directly to Cloudinary without writing files to local disk storage:

```
Admin Multipart POST /products/:id/images
             ↓
    Multer Memory Parser (Restricts files to 2MB, max 5 files)
             ↓
Validate Magic Bytes Header signature (verifies PNG/JPG/WEBP structure)
             ↓
Stream buffer chunks to Cloudinary: pipes Readable.from(file.buffer) to upload_stream
             ↓
Save url, publicId, and primary flag on Product.images array
```

- **Safety Checks**: Rather than trusting client extensions, `validateImageSignature` checks the first 4 bytes of the buffer in hexadecimal (e.g., `89504E47` for PNG, `FFD8FF` for JPG, `52494646` for WEBP).

---

## 8. Error Handling & Unified API Envelopes

We maintain a centralized error middleware block:

1.  **Wrapper (`asyncHandler`)**: Automatically wraps asynchronous controllers, propagating any thrown errors directly to `next()`.
2.  **Custom Errors (`ApiError`)**: Standardized custom errors with custom HTTP status codes and API error envelopes.
3.  **Global Handler (`error.middleware.js`)**:
    *   Catches `ApiError` and sends custom JSON packages.
    *   Catches Mongoose validation errors and translates them to `422 validation errors`.
    *   Catches duplicate unique key database errors (e.g., duplicate registration emails) and returns a `409 Conflict`.
    *   Filters raw `500 Server Errors` in production to prevent internal folder structures from leaking to clients.
