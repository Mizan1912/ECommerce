# Admin Module — Setup & Reference

End-to-end admin console: Express/MongoDB API (`ECommerceBE`) + React admin UI (`ECommerceFE/ReactFrontend`).

## Credentials

Seeded by `npm run seed:admin` (values come from `ADMIN_*` in `ECommerceBE/.env`):

| Role     | Email                     | Password        |
| -------- | ------------------------- | --------------- |
| Admin    | `admin@ecommerce.local`   | `Admin@12345`   |
| Customer | `customer@ecommerce.local`| `Customer@12345`|

The customer account and sample catalogue/orders come from `npm run seed:demo`.
Change `ADMIN_PASSWORD` in `.env` and re-run `npm run seed:admin` to rotate the password.

## Running locally

```bash
# API — http://localhost:5000
cd ECommerceBE
npm install
npm run seed:admin     # creates/repairs the admin account
npm run seed:demo      # optional: demo products, customer, orders, payments
npm start              # or: npm run dev

# Admin UI — http://localhost:5173/admin
cd ECommerceFE/ReactFrontend
npm install
npm run dev
```

`ECommerceBE/.env` is pre-filled for local development (Mongo at `mongodb://127.0.0.1:27017/ecommerce`).
Cloudinary and Razorpay keys are placeholders — image uploads need real `CLOUDINARY_*` values.

`ECommerceFE/ReactFrontend/.env` sets `VITE_API_BASE_URL=http://localhost:5000/api/v1`.

Log in at `/login`; an admin is redirected to `/admin`, a customer to the storefront.

## Admin API

All routes are under `/api/v1/admin`, require `Authorization: Bearer <accessToken>`, and are gated on `role === "admin"`
(401 without a token, 403 for customers). Responses use the standard envelope
`{ success, message?, data, meta? }`, with `meta.pagination = { total, page, limit, totalPages }` on list routes.

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET | `/stats` | Dashboard: revenue, order/status counts, low stock, 30-day trend, best sellers, recent orders |
| GET | `/users` | List users — `q`, `role`, `isActive`, `page`, `limit`, `sort` |
| GET | `/users/:id` | Single user plus order count and lifetime spend |
| PATCH | `/users/:id` | Update `name`, `role`, `isActive` |
| DELETE | `/users/:id` | Delete a user with no orders |
| GET | `/orders` | List orders — `q` (order number), `status`, `paymentStatus`, `page`, `limit` |
| GET | `/orders/:id` | Order (by id or order number) with payments and `allowedTransitions` |
| PATCH | `/orders/:id/status` | Move order through the state machine |
| GET | `/products` | Catalogue incl. inactive — `q`, `category`, `status`, `stock`, `page`, `limit`; `meta.categories` |
| POST | `/products` | Create product |
| GET | `/products/:id` | Single product |
| PATCH | `/products/:id` | Update product fields |
| DELETE | `/products/:id` | Deactivate; `?hard=true` deletes permanently (blocked if ordered) |
| PATCH | `/products/:id/stock` | `{ delta }` relative or `{ stock }` absolute |
| POST | `/products/:id/images` | Multipart `images` (≤5 files, 2MB, JPEG/PNG/WEBP) → Cloudinary |
| DELETE | `/products/:id/images/:imageId` | Remove image (promotes another to primary) |
| PATCH | `/products/:id/images/:imageId/primary` | Set primary image |
| GET | `/payments` | Payment ledger — `q`, `status`, `provider`, `page`, `limit` |

### Order state machine

```
pending  → paid, cancelled
paid     → processing, refunded
processing → shipped
shipped  → delivered
delivered / cancelled / refunded → (final)
```

Cancelling restores stock. Moving to `paid` stamps `paidAt`; moving to `refunded` marks related payments refunded.

### Guard rails

- The last active admin cannot be demoted, deactivated, or deleted.
- Admins cannot change their own role, deactivate themselves, or delete their own account.
- Users with orders and products that appear in orders can only be deactivated, never hard-deleted.
- Deactivated users (`isActive: false`) are rejected at login with 403.

## Admin UI

| Route | Screen |
| ----- | ------ |
| `/admin` | Dashboard — KPIs, 30-day revenue trend, low stock, recent orders, best sellers |
| `/admin/products` | Catalogue with search/filters, activate–deactivate, delete |
| `/admin/products/new`, `/admin/products/:id/edit` | Product editor with validation and image manager |
| `/admin/inventory` | ±1 and exact-count stock adjustments, low/out-of-stock filters |
| `/admin/orders` | Order list with filters and inline status transitions |
| `/admin/orders/:id` | Order detail: items, payments, customer, allowed transitions |
| `/admin/users` | User list, edit modal (name/role/status), deactivate, delete |
| `/admin/uploads` | Media library — upload, delete, set primary image |
| `/admin/payments` | Razorpay payment ledger (read-only) |

Sessions persist the JWT in `localStorage`; a 401 clears it and the admin routes redirect back to `/login?next=…`.
