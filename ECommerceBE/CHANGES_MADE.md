# Backend Changes Log — Completed Features

This document details the file modifications, creations, and configuration changes introduced to complete the missing roadmap features.

---

## 1. Phase 7: Idempotency System Hardening

We replaced the basic, static idempotency logic with a robust, SHA-256 content-hashed, concurrent-request-safe idempotency solution.

*   **[`Idempotency.model.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/models/Idempotency.model.js) [MODIFIED]**:
    *   Added `requestHash` (String) to compare request body contents.
    *   Added `statusCode` (Number) to replay the exact original HTTP status code.
    *   Added `state` (String: `"in-flight"` / `"completed"`) to handle concurrent locks.
    *   Added `createdAt` with a 24-hour TTL index to auto-clean up records.
*   **[`idempotency.middleware.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/middlewares/idempotency.middleware.js) [MODIFIED]**:
    *   Hashed request bodies using SHA-256.
    *   Checked for existing keys. If a key is `in-flight`, it returns `409 Conflict` (request is currently processing).
    *   Replays cached response bodies and status codes on matching request hashes, or rejects with `422 Unprocessable Entity` if the key is reused with different parameters.
    *   Intercepts outbound responses (`res.send`) to cache status/payloads for `2xx`/`4xx` responses and delete `in-flight` locks on `5xx` internal errors.
*   **[`checkout.routes.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/api/v1/checkout/checkout.routes.js) [MODIFIED]**:
    *   Mounted `idempotencyMiddleware` on the `POST /` checkout route.
*   **[`checkout.controller.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/api/v1/checkout/checkout.controller.js) [MODIFIED]**:
    *   Removed manual idempotency database writes since the middleware now intercepts and handles persistence automatically.

---

## 2. Phase 8: Razorpay Webhook & Payments

We resolved payload path issues, set up signature verification, handled failure cases, and enabled raw request body verification.

*   **[`app.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/app.js) [MODIFIED]**:
    *   Modified `express.json()` with a `verify` function to store the incoming raw payload string in `req.rawBody` for signature validation.
*   **[`ProcessedEvent.model.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/models/ProcessedEvent.model.js) [NEW]**:
    *   Introduced a schema to log processed webhook event IDs to prevent duplicate webhook processing (with a 7-day TTL index).
*   **[`payments.service.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/api/v1/payments/payments.service.js) [MODIFIED]**:
    *   Corrected the Razorpay order ID path typo (`event.payload.entity.order_id` -> `event.payload.payment.entity.order_id`).
    *   Added verification for duplicate webhook events using `ProcessedEvent`.
    *   Added event parsing and action handling for both `payment.captured` (paid status) and `payment.failed` (failed status, order cancellation, and inventory restock).

---

## 3. Phase 9: Order Lifecycle & Cancellation

We added support for order cancellations and atomic stock restoration.

*   **[`db.utils.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/utils/db.utils.js) [NEW]**:
    *   Created `getTransactionSession` to check if MongoDB is running as a Replica Set. If it is standalone (like local dev), it falls back to sessionless execution rather than throwing transaction errors.
*   **[`orders.service.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/api/v1/orders/orders.service.js) [MODIFIED]**:
    *   Refactored transaction handling in `cancelOrder` and `updateOrderStatus` to use `db.utils.js`.
    *   Implemented `cancelOrder` to restore stock atomically by incrementing products back by the ordered quantity, changing status to `"cancelled"`, and payment status to `"failed"`.
    *   Fixed a bug in `updateOrderStatus` where the new status was never assigned to `order.status` before saving.
*   **[`orders.validator.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/api/v1/orders/orders.validator.js) [MODIFIED]**:
    *   Added `cancelOrderSchema` to validate the `orderNumber` route parameter.
*   **[`orders.controller.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/api/v1/orders/orders.controller.js) [MODIFIED]**:
    *   Implemented `cancelOrderController` to parse params and invoke the cancellation service.
*   **[`orders.routes.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/api/v1/orders/orders.routes.js) [MODIFIED]**:
    *   Mounted `POST /:orderNumber/cancel` with authorization and validation middlewares.

---

## 4. Phase 10: File Uploads & Cloudinary

We added a Multer and Cloudinary-powered image upload and delete pipeline.

*   **[`cloudinary.provider.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/providers/cloudinary.provider.js) [NEW]**:
    *   Configures and exports the Cloudinary v2 SDK.
*   **[`upload.middleware.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/middlewares/upload.middleware.js) [NEW]**:
    *   Sets up Multer memory storage.
    *   Restricts uploads to 2MB, whitelists MIME types (`image/jpeg`, `image/png`, `image/webp`), and limits batch uploads to 5 files.
    *   Performs file magic bytes validation (`validateImageSignature`) to check file headers and block malicious renamed uploads.
*   **[`admin.routes.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/api/v1/admin/admin.routes.js) [NEW]**:
    *   Exposes endpoints under a unified auth and admin guard:
        *   `GET /users` & `PATCH /users/:id` (User role/status adjustment)
        *   `GET /orders` & `PATCH /orders/:id/status` (Order status change)
        *   `PATCH /products/:id/stock` (Product manual stock adjustment)
        *   `POST /products/:id/images` (Cloudinary upload integration)
        *   `DELETE /products/:id/images/:imageId` (Cloudinary deletion integration)
*   **[`admin.controller.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/api/v1/admin/admin.controller.js) [NEW]**:
    *   Bridges admin HTTP routes to the admin service functions.
*   **[`admin.service.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/api/v1/admin/admin.service.js) [NEW]**:
    *   Exposes database logic for user adjustments, manual stock increases/decreases, and Cloudinary uploads/deletions.

---

## 5. Phase 11: API Documentation

We set up OpenAPI and Swagger UI.

*   **[`swagger.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/config/swagger.js) [NEW]**:
    *   Initializes `swagger-jsdoc` options pointing to our routing paths and sets up a Bearer Auth token scheme definition.
*   **[`app.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/app.js) [MODIFIED]**:
    *   Mounted `serveDocs` and `setupDocs` on the `/docs` path.

---

## 6. Logs Simplification & Swagger Populating (Latest Edits)

*   **[`swagger.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/config/swagger.js) [MODIFIED]**:
    *   Populated detailed OpenAPI path specifications directly in the definition, enabling full routing details, parameters, requests, and security authorizations in Swagger UI.
*   **[`logger.middleware.js`](file:///c:/Users/UNIQUE%20ENTERPRISES/Documents/ECommerce/ECommerceBE/src/middlewares/logger.middleware.js) [MODIFIED]**:
    *   Configured custom pino-http serializers to disable logging the full `req` and `res` objects on every HTTP request, and defined `customSuccessMessage` and `customErrorMessage` templates to print clean, concise, single-line summaries of request executions.

