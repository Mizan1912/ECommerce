# Admin Panel — Setup and Feature Guide

The admin area is complete front to back: a role-gated React console at `/admin` talking to
role-gated `/api/v1/admin/*` endpoints on the Express API.

## Credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@ecommerce.local` | `Admin@12345` |
| Demo customer | `customer@ecommerce.local` | `Customer@12345` |

The admin account is created by `npm run seed:admin` and can be overridden with `ADMIN_NAME`,
`ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `ECommerceBE/.env`. Re-running the seed is safe: it promotes
an existing account with that email to admin, reactivates it, and resets the password.

> Change the password before deploying anywhere public, and replace the dev JWT secrets in `.env`.

## Running it

```bash
# 1. API  (http://localhost:5000)
cd ECommerceBE
npm install
npm run seed:admin     # creates the admin account
npm run seed:demo      # optional: 5 products, a customer, 3 orders, 3 payments
npm start

# 2. Web  (http://localhost:5173)
cd ECommerceFE/ReactFrontend
npm install
npm run dev
```

Then open <http://localhost:5173/login>, sign in with the admin credentials, and the app routes you
straight to `/admin`. API docs live at <http://localhost:5000/docs> (Admin tag).

Environment files:

- `ECommerceBE/.env` — MongoDB URI, JWT secrets, mail, Razorpay, Cloudinary, admin seed values.
- `ECommerceFE/ReactFrontend/.env` — `VITE_API_BASE_URL` (defaults to `http://localhost:5000/api/v1`).

Image uploads are the one feature that needs third-party credentials: fill in `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` before uploading. Everything else runs on a local
MongoDB with no external accounts.

## What the panel does

| Screen | Capabilities |
| --- | --- |
| **Dashboard** `/admin` | Paid revenue (total, 30 day, average order), order counts by state, product and user totals, 30-day revenue bars, low-stock list, best sellers, recent orders, payment status tiles |
| **Products** `/admin/products` | Search and filter by category, status, and stock health; paginated; activate/deactivate; permanent delete (blocked when the product appears in orders) |
| **Product editor** `/admin/products/new`, `/:id/edit` | Create and update with client-side validation matching the API schema; visibility toggle; upload/delete images and pick the primary one |
| **Inventory** `/admin/inventory` | ±1 steppers and exact-count save per product, low/out-of-stock filters, health badges |
| **Orders** `/admin/orders` | Filter by order and payment status, search by order number, inline "move to…" limited to legal transitions |
| **Order detail** `/admin/orders/:orderNumber` | Line items, totals, payment attempts, customer info, and the allowed next states as buttons |
| **Users** `/admin/users` | Search and filter by role/status, edit name and role, activate/deactivate, delete users without orders, per-user order count and lifetime spend |
| **Uploads** `/admin/uploads` | Media library across products: multi-file upload, delete, set primary |
| **Payments** `/admin/payments` | Razorpay ledger with provider references, status filters, links back to orders |

## Admin API

All routes require `Authorization: Bearer <accessToken>` from `POST /api/v1/auth/login` **and** the
`admin` role; anything else gets 401/403.

```
GET    /api/v1/admin/stats

GET    /api/v1/admin/users                        ?q= &role= &isActive= &page= &limit=
GET    /api/v1/admin/users/:id                    user + orderCount + totalSpent
PATCH  /api/v1/admin/users/:id                    { name?, role?, isActive? }
DELETE /api/v1/admin/users/:id

GET    /api/v1/admin/orders                       ?q= &status= &paymentStatus= &page= &limit=
GET    /api/v1/admin/orders/:idOrNumber           order + payments + allowedTransitions
PATCH  /api/v1/admin/orders/:idOrNumber/status    { status }

GET    /api/v1/admin/products                     ?q= &category= &status= &stock= &page= &limit=
POST   /api/v1/admin/products                     { title, description, category, price, stock, isActive? }
GET    /api/v1/admin/products/:id
PATCH  /api/v1/admin/products/:id
DELETE /api/v1/admin/products/:id                 ?hard=true for permanent delete
PATCH  /api/v1/admin/products/:id/stock           { delta } or { stock }

POST   /api/v1/admin/products/:id/images          multipart, field "images", max 5 × 2MB
DELETE /api/v1/admin/products/:id/images/:imageId
PATCH  /api/v1/admin/products/:id/images/:imageId/primary

GET    /api/v1/admin/payments                     ?q= &status= &provider= &page= &limit=
```

Responses follow the existing envelope: `{ success, message?, data, meta? }`, with
`meta.pagination = { total, page, limit, totalPages }` on list endpoints.

## Rules the backend enforces

- **Order transitions** follow the state machine: `pending → paid | cancelled`, `paid → processing |
  refunded`, `processing → shipped`, `shipped → delivered`. Anything else is a 400. Cancelling
  restores stock in a transaction; refunding also marks paid payments refunded.
- **Stock** can never go negative, whether set by delta or absolute value.
- **Admin safety**: you cannot change your own role, deactivate or delete your own account, and the
  last active admin cannot be demoted or deactivated.
- **Deletion**: users with orders and products that appear in orders cannot be deleted — deactivate
  them instead. Hard-deleting a product also removes its Cloudinary images.
- **Deactivated users** (`isActive: false`) are refused at login with a 403.
- **Uploads** are checked by MIME type *and* magic-byte signature before reaching Cloudinary.

## Notable schema changes

- `User.isActive` (boolean, default `true`) — drives deactivation and the login block.
- `Product.images[].isPrimary` (boolean, default `false`) — one primary image per product; deleting
  the primary promotes the next image.
