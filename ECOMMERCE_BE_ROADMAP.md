# E-Commerce Backend Roadmap From Scratch

This roadmap turns the system design plan into a build order. It is meant to tell you what to add, what to decide, what to test, and what terms to research while you build the backend yourself.

The project target is a production-style e-commerce REST API with Node.js, Express, MongoDB, Mongoose, authentication, admin operations, cart, checkout, payments, uploads, documentation, and tests.

Use the roadmap in order. Do not jump to checkout before the app skeleton, validation, authentication, and database rules are stable.

---

## 1. Final Product You Are Building

At the end, your backend should support:

- A public product catalogue with search, filtering, sorting, pagination, and product details.
- Customer registration, login, refresh-token flow, logout, profile access, password reset, and email verification basics.
- Admin-only product, stock, user, and order management.
- A customer cart with item quantity updates and stock checks.
- Checkout that creates an order atomically and avoids duplicate orders on retries.
- Payment records and a mock webhook flow that behaves like a real payment provider integration.
- Product image uploads to external media storage.
- API documentation through OpenAPI/Swagger and a Postman collection.
- Central error handling, structured logging, environment validation, security middleware, and integration tests.

Keep React or any frontend out of scope until this API is clear, documented, and testable from Postman.

---

## 2. Rules To Follow Before Coding

### Project rules

- Build a modular monolith first.
- Keep business logic in services, not routes.
- Keep database schemas and query design close to the features that need them.
- Validate all inputs before using them.
- Store secrets only in environment variables.
- Use Git commits at meaningful milestones.
- Make every phase runnable before moving to the next one.

### Data rules

- Store money as integer minor units such as paise or cents.
- Snapshot order item data when the order is created.
- Do not trust cart price, client role, client totals, client stock values, or uploaded file metadata.
- Prefer soft business state such as `isActive` or `status` over deleting important business history.

### API rules

- Mount routes under `/api/v1`.
- Use plural resource names.
- Use HTTP status codes deliberately.
- Return one response shape for success and one response shape for errors.
- Document every endpoint when it becomes stable.

### RnD terms

Research these before or during the first phases:

- REST resource design
- layered architecture
- modular monolith
- feature-first folder structure
- Express middleware lifecycle
- Mongoose model, schema, middleware, indexes
- request validation
- error envelope
- environment schema validation
- dependency boundary

---

## 3. What To Decide Up Front

Write these decisions into your README or notes before implementation:

| Decision | Recommended starting choice |
|---|---|
| Language | JavaScript first, TypeScript only if you already want the extra setup |
| Runtime | Current supported Node.js LTS |
| HTTP framework | Express |
| Database | MongoDB with replica-set support |
| ODM | Mongoose |
| Validation | Zod or Joi, pick one |
| Test stack | Jest, Supertest, mongodb-memory-server |
| Logger | Pino |
| API docs | OpenAPI with Swagger UI |
| Upload storage | Cloudinary first, S3 as an alternative |
| Auth pattern | JWT access token plus rotated opaque refresh token |

Do not spend days comparing libraries. Pick a stable choice and move on. The deeper learning is in data consistency, security boundaries, and API behavior.

---

## 4. Project Setup From Empty Folder

### 4.1 Initialize the repository

Add:

- Git repository.
- `package.json`.
- Node version note through `.nvmrc`, `engines`, or README.
- `.gitignore`.
- `.env.example`.
- `README.md`.
- `src` folder.
- `tests` folder.
- `docs` folder.

Make sure `.gitignore` excludes:

- `.env`
- `node_modules`
- logs
- coverage output
- local upload temp folders if you ever use disk uploads
- editor or OS noise only when relevant

### 4.2 Install the first dependencies

Runtime areas you will need:

- Express application server.
- Environment loading and environment validation.
- MongoDB connection through Mongoose.
- Cookie parsing.
- CORS.
- security headers.
- rate limiting.
- request logging.
- validation library.
- password hashing.
- JWT signing and verification.

Development areas you will need:

- restart-on-change dev server.
- linter.
- formatter.
- test runner.
- HTTP integration test library.
- in-memory MongoDB test support.

### 4.3 Create the application entry shape

Add separate responsibilities:

- `app` file: builds Express app and mounts middleware/routes.
- `server` file: loads config, connects database, starts HTTP listener.
- database config module.
- environment config module.
- health route.
- error utilities.
- logger setup.

Your first runnable endpoint should be:

- `GET /health`

It should prove:

- server starts.
- config loads.
- middleware chain works.
- response format is established.

### 4.4 First checks

Before feature work, verify:

- app starts with valid env values.
- app fails clearly with missing mandatory env values.
- `/health` responds.
- test runner executes one health-route test.
- lint and format commands exist.

### RnD terms

- application bootstrap
- configuration validation
- graceful shutdown
- process signals
- dependency injection basics
- supertest Express app testing
- `app.listen` separation for tests

---

## 5. Folder And Module Roadmap

Create folders only when they have a job. A good backend layout will need places for:

- API version routes.
- feature modules.
- models.
- middleware.
- config.
- shared utilities.
- validation schemas.
- tests.
- docs.

Each feature module should eventually own:

- routes
- controller
- service
- validator
- feature-specific constants when needed

Shared areas should eventually hold:

- authentication middleware
- role middleware
- validation middleware
- request-id middleware
- global error middleware
- rate-limit middleware
- idempotency middleware
- `ApiError`
- async controller wrapper
- token helpers
- hashing helpers
- pagination helpers
- logger

### RnD terms

- cohesion and coupling
- controller-service-repository tradeoff
- cross-cutting concerns
- middleware composition
- feature module ownership

---

## 6. API Contract Foundation

Do this before many routes exist.

### Add

- A version prefix: `/api/v1`.
- A standard success response shape.
- A standard error response shape.
- A not-found route handler.
- A central error handler.
- Request validation wrapper.
- Consistent field naming.
- Consistent query parsing rules.

### Decide

- When you return `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `422`, `429`, and `500`.
- Whether validation failures are `400` or `422`; use one rule consistently.
- How pagination metadata looks.
- How API error codes look.
- Whether IDs in public endpoints use Mongo `_id`, slug, order number, or a mix.

### Must handle in error middleware

- validation failures
- malformed Mongo IDs
- duplicate unique keys
- authentication failures
- authorization failures
- unknown routes
- unexpected server errors

### RnD terms

- API contract
- idempotent HTTP methods
- error taxonomy
- HTTP semantics
- route parameter validation
- Express error middleware
- Mongoose duplicate key error

---

## 7. Configuration, Secrets, And Runtime Safety

### Add `.env.example` entries for

- runtime environment
- server port
- MongoDB URI
- access-token secret and TTL
- refresh-token secret or token hashing secret if used
- refresh-token TTL
- cookie settings
- CORS allowed origins
- mail provider values
- Cloudinary or S3 values
- webhook signing secret
- rate-limit values
- Swagger protection values if docs are protected in production

### Add code for

- one validated config module.
- database connect and disconnect handling.
- startup failure when mandatory env is invalid.
- clear logger output during startup.
- safe shutdown on process termination.

### Do not do

- read random `process.env` values throughout services.
- commit real secrets.
- let production fall back to unsafe placeholder secrets.

### RnD terms

- twelve-factor app config
- secret management
- startup validation
- MongoDB connection lifecycle
- SIGINT and SIGTERM

---

## 8. Database Design Roadmap

Plan the collections before implementing routes.

### 8.1 Collections to create

Start with:

- User
- RefreshToken
- Product
- Cart
- Order
- Payment
- IdempotencyKey
- WebhookEvent or processed-event tracking

Optional later:

- InventoryAdjustment
- AuditLog
- Coupon
- AddressBook
- Review

### 8.2 User data

Include fields for:

- email
- password hash
- role
- email verification state
- active/deactivated state
- password reset token hash
- password reset expiry
- password changed timestamp
- timestamps

Add indexes and rules for:

- unique normalized email
- password hash hidden from normal selection
- allowed role values

### 8.3 Refresh token data

Include fields for:

- user reference
- hashed refresh token
- token family identifier
- expiry
- revoked state or revocation timestamp
- replacement relationship if useful
- IP
- user agent
- timestamps

Add:

- TTL index for expiry.
- lookup indexes that match refresh and revoke operations.

### 8.4 Product data

Include fields for:

- SKU
- slug
- title
- description
- category
- price in minor units
- currency if your API may expand beyond one currency
- stock
- reserved stock if you implement reservations
- images
- active state
- timestamps

Add:

- unique SKU.
- unique slug.
- catalogue query indexes.
- text-search strategy for title and description if used.

### 8.5 Cart data

Include:

- user reference
- embedded item list
- product reference per item
- quantity per item
- timestamps

Decide:

- one cart per user.
- how to remove zero quantity.
- whether a cart shows latest price from product data or a display snapshot.

### 8.6 Order data

Include:

- user reference
- order number
- line-item snapshots
- address snapshot
- totals
- currency
- payment reference
- order status
- idempotency reference if helpful
- timestamps

Line-item snapshots should include:

- product reference
- SKU
- product title at purchase time
- unit price at purchase time
- quantity
- line total

### 8.7 Payment data

Include:

- order reference
- provider
- provider payment identifier
- amount
- currency
- payment status
- webhook-related audit context as appropriate
- timestamps

### 8.8 Idempotency data

Include:

- client idempotency key
- requester identity
- endpoint identity
- request fingerprint or hash
- in-progress/completed state
- stored response status
- stored response body
- expiry timestamp

### RnD terms

- embedded document vs referenced document
- unique index
- compound index
- TTL index
- MongoDB text index
- schema validation
- denormalization
- immutable order snapshot
- data lifecycle

---

## 9. Security Baseline Before Business Features

### Add middleware for

- security headers.
- CORS allowlist.
- cookie parsing.
- JSON body size limits.
- URL-encoded body size limits if needed.
- sanitization against Mongo operator injection.
- parameter pollution protection if library choice is sound.
- request rate limiting.
- request IDs and logs.

Check current maintenance status before adding security libraries. Some older packages become stale even when tutorials still mention them.

### Add route-level controls for

- login rate limits.
- password-reset request rate limits.
- checkout abuse limits.
- admin authorization.

### Decide cookie policy for refresh token

You need to understand:

- `httpOnly`
- `secure`
- `sameSite`
- cookie `path`
- cookie max age
- cross-origin credentials behavior

### Add security notes to README

Explain:

- what uses bearer access tokens.
- what uses refresh cookies.
- how CSRF risk changes when cookies are automatically sent.
- why role comes from a verified token and database rules, not request body.

### RnD terms

- OWASP API Security Top 10
- Helmet
- CORS credentials
- CSRF
- XSS
- NoSQL injection
- HTTP parameter pollution
- brute-force protection
- least privilege

---

## 10. Authentication And Authorization Roadmap

Build auth before products that need admin actions.

### 10.1 User registration

Add:

- register validator.
- email normalization rule.
- password policy.
- password hashing.
- duplicate-email handling.
- user response serializer that never returns password fields.

Test:

- successful registration.
- invalid email.
- weak or missing password.
- duplicate registration.
- password hash is stored, raw password is not.

### 10.2 Login

Add:

- login validator.
- password comparison.
- access-token issuing.
- refresh-token generation.
- hashed refresh-token storage.
- refresh cookie setting.
- security logging for bad credentials.

Test:

- correct login.
- wrong password.
- missing fields.
- deactivated user.
- rate-limit behavior.

### 10.3 Refresh flow

Add:

- refresh-cookie reading.
- refresh-token lookup through hash.
- token rotation.
- token family behavior.
- detection of reused invalidated refresh token.
- cookie replacement.

Test:

- refresh returns a new access token.
- old refresh token cannot be used like a permanent password.
- logout or revocation blocks future refresh.

### 10.4 Auth middleware

Add:

- bearer-token extraction.
- JWT verification.
- authenticated user identity attached to request.
- authorization middleware by role.
- admin-route guard.

Test:

- no token.
- expired or invalid token.
- customer blocked from admin endpoint.
- admin allowed.

### 10.5 Password reset and email verification

Add:

- forgot-password endpoint.
- reset token generation.
- hashed reset token storage.
- short reset expiry.
- mail integration for development.
- reset-password endpoint.
- refresh-token invalidation after password change.
- email verification token flow if you include verification now.

Keep the public forgot-password response neutral so it does not reveal whether an email exists.

### 10.6 Optional auth polish

Later add:

- MFA with TOTP.
- active-session list.
- logout-all-sessions.
- device/session audit trail.

### RnD terms

- bcrypt cost factor
- JWT claims
- JWT expiry
- token rotation
- opaque refresh token
- refresh token reuse detection
- RBAC
- email enumeration
- cryptographic random token
- token hashing at rest

---

## 11. Product Catalogue And Admin Product Roadmap

### 11.1 Public products

Add:

- product model.
- product validators.
- product list route.
- product detail route by slug.
- active-product filtering.
- pagination.
- sorting allowlist.
- category filter.
- keyword search.
- price range filters.

Do not expose inactive products in public listing unless your API explicitly says so.

### 11.2 Admin product management

Add admin-only routes for:

- create product.
- edit product.
- activate/deactivate product.
- delete only if you clearly understand historical order effects.
- change stock through an explicit stock operation.

Validate:

- SKU format.
- slug behavior.
- title and description limits.
- non-negative price.
- stock rules.
- image references after upload support exists.

### 11.3 Catalogue tests

Test:

- product create allowed only for admin.
- product detail not found.
- filters combine correctly.
- invalid sort and invalid pagination input.
- unique SKU and slug conflicts.
- inactive products are hidden publicly.

### RnD terms

- offset pagination
- cursor pagination
- query allowlist
- MongoDB collation
- slug generation
- search index
- inventory invariants

---

## 12. Cart Roadmap

### Add customer cart routes for

- get cart.
- add item.
- set item quantity.
- remove one item.
- clear cart.

### Cart rules

- Require authentication.
- Keep one active cart per user at first.
- Validate product existence and product active state.
- Check available stock when adding or increasing quantity.
- Do not treat cart as a reservation.
- Recompute trusted price information during checkout.

### Cart tests

- cart auto-creation.
- add new item.
- increment existing item.
- update quantity.
- remove zero quantity.
- reject inactive or missing product.
- reject quantity above available stock.

### RnD terms

- upsert
- atomic array update
- cart price staleness
- stock availability
- derived totals

---

## 13. Inventory Roadmap

Inventory is not just a `stock` number. Define the rules before checkout.

### Add

- stock fields on products.
- available-stock calculation.
- admin stock-adjustment endpoint.
- reason field for stock adjustment.
- inventory audit record if you want stronger traceability.

### Decide

- whether checkout directly decrements stock or first reserves and later confirms.
- what happens when payment fails.
- whether pending-payment orders expire.
- how you prevent negative available stock.

### Minimum invariant

The system must never accept a checkout that requires more units than are currently available under concurrent requests.

### RnD terms

- inventory reservation
- compensating transaction
- lost update
- atomic conditional update
- optimistic concurrency
- audit log

---

## 14. Checkout Roadmap

This is the core backend challenge. Do it after auth, product, cart, validation, errors, and database setup are working.

### 14.1 Prerequisites

Before checkout, make sure:

- MongoDB transactions are available through replica-set support.
- cart data exists.
- product stock rules exist.
- order schema exists.
- payment schema exists.
- error responses exist.
- idempotency design is understood.

### 14.2 Checkout endpoint

Add:

- authenticated checkout route.
- required `Idempotency-Key` header.
- checkout request validation.
- checkout service.
- transaction session lifecycle.
- order number generation strategy.
- total calculation.
- order creation.
- payment creation.
- cart clearing after transaction writes are ready.

### 14.3 Transaction responsibilities

Within the transaction:

- load trusted products.
- validate cart items still point to purchasable products.
- validate stock atomically.
- use product prices, not user-submitted totals.
- calculate subtotal, tax, shipping, and final total by your chosen rules.
- snapshot order items.
- update stock or reservation fields.
- create order.
- create payment record.
- clear cart.

### 14.4 Idempotency responsibilities

Add:

- idempotency-key model.
- request fingerprint.
- completed response replay.
- wrong-key-reuse rejection.
- in-flight behavior decision.
- TTL cleanup.

### 14.5 Checkout tests

Test:

- checkout happy path.
- empty cart.
- stock unavailable.
- product price changed since cart item was added.
- concurrent checkout for last stock unit.
- transaction rollback on failure.
- same idempotency key creates only one order.
- same idempotency key with different request is rejected.

### RnD terms

- ACID transaction
- MongoDB session
- `withTransaction`
- retryable transaction
- idempotency key
- request fingerprint
- race condition
- conditional update
- order number collision
- minor-unit arithmetic

---

## 15. Orders Roadmap

### Customer order features

Add:

- list own orders.
- get own order detail.
- order status exposure.
- safe order serialization.

### Admin order features

Add:

- list orders with filters.
- view order details.
- update allowed fulfillment statuses.

### Decide status transitions

Define a status flow before you implement updates. Include:

- pending payment.
- paid.
- payment failed.
- cancelled if supported.
- shipped.
- delivered.

Avoid arbitrary status jumps. Admin status updates should follow transition rules.

### RnD terms

- finite state machine
- order lifecycle
- immutable financial record
- authorization by resource ownership

---

## 16. Payments And Webhook Roadmap

### 16.1 Mock provider

Add a development-only payment simulator that can send:

- success events.
- failure events.
- duplicate events.
- bad-signature events for tests.

### 16.2 Webhook receiver

Add:

- raw-body handling for the webhook route.
- signature verification.
- event validation.
- processed-event tracking.
- payment status update.
- order status update.
- failure restock or reservation-release behavior.

### 16.3 Webhook tests

Test:

- invalid signature rejected.
- valid success event marks payment and order.
- duplicate event does not duplicate work.
- failure event moves order/payment to failure state.
- inventory compensation happens exactly once.

### 16.4 Real provider research for later

When moving beyond mock payment, research provider-specific:

- payment intent model.
- webhook signature verification.
- event retries.
- event ordering.
- test mode.
- refund APIs.
- dispute and chargeback events.

### RnD terms

- webhook HMAC
- raw request body
- replay attack
- webhook idempotency
- eventual consistency
- payment intent
- asynchronous provider callback

---

## 17. Uploads And Product Images Roadmap

### Add

- admin image-upload route.
- multipart parser.
- file-count limit.
- file-size limit.
- file-type allowlist.
- actual file signature verification.
- upload service for Cloudinary or S3.
- stored image metadata on Product.
- primary-image rule.
- image-delete route and provider cleanup.

### Validate

- admin role.
- product existence.
- file presence.
- real file type.
- oversized payload.
- provider error behavior.

### Decide

- whether public product images are public URLs.
- how deleted product images are cleaned from storage.
- whether image order matters.
- how private documents would use signed URLs later.

### RnD terms

- multipart/form-data
- Multer memory storage
- MIME sniffing
- magic bytes
- upload stream
- Cloudinary public ID
- S3 presigned URL
- object storage access control

---

## 18. Documentation Roadmap

Documentation is part of the deliverable, not the final decoration.

### Add OpenAPI documentation for

- auth endpoints.
- product endpoints.
- cart endpoints.
- checkout endpoint.
- order endpoints.
- payment webhook contract.
- admin endpoints.
- upload endpoints.
- error response format.
- authentication scheme.

### Add Postman assets

- collection.
- environment template without secrets.
- saved examples for main flows.
- auth-token handling notes or scripts only when you understand them.

### Add README sections

- project goal.
- stack.
- architecture.
- folder map.
- setup.
- environment variables.
- MongoDB transaction requirement.
- commands.
- API docs route.
- test commands.
- demo flow.
- known limitations.

### RnD terms

- OpenAPI components
- Swagger schema reference
- Postman environment
- API contract testing
- example payload hygiene

---

## 19. Testing Roadmap

### 19.1 Testing layers

Use:

- integration tests for routes and database behavior.
- unit tests for pure utilities and calculations.
- focused concurrency tests for checkout.
- contract checks if you have time after docs stabilize.

### 19.2 Test setup

Add:

- test environment config.
- isolated test database.
- database cleanup strategy.
- factory or fixture helpers.
- auth helper for test tokens or login flow.
- replica-set test support where transactions are exercised.

### 19.3 Minimum test matrix

Cover:

- health and error handling.
- validation middleware.
- auth happy and unhappy paths.
- RBAC.
- product CRUD and public listing.
- cart mutations.
- checkout transaction and idempotency.
- payment webhook signature and duplicate delivery.
- upload validation.

### 19.4 Non-functional checks

Also check:

- secrets do not appear in logs.
- passwords and token hashes are not serialized.
- large bodies are rejected.
- rate limits behave on protected abuse targets.
- invalid state transitions fail.

### RnD terms

- integration test
- fixture
- factory
- test isolation
- mongodb-memory-server replica set
- concurrency test
- contract test

---

## 20. Seed Data, Admin Bootstrap, And Operations

### Development data

Add a deliberate way to create:

- one admin user for local development.
- a few product categories.
- products with different prices and stock counts.
- out-of-stock and inactive products for testing.
- a normal customer account for demo flow.

Do not hide seed behavior inside server startup. Keep it as an explicit command or script so development data does not surprise production.

### Admin bootstrap

Decide how the first admin appears:

- one-time seed command.
- protected manual database setup documented in README.
- production-only bootstrap process through deployment secrets.

Do not expose a public "become admin" path for convenience.

### Release basics

Before calling the project deployable, add or decide:

- production environment variable source.
- hosted MongoDB replica-set or cluster choice.
- database network access rules.
- log collection destination.
- health check behavior.
- CORS production origins.
- HTTPS termination.
- cookie production settings.
- upload provider production credentials.
- mail provider production credentials.
- Swagger visibility in production.

### Data safety

Document:

- database backup expectation.
- restore expectation.
- TTL cleanup expectations.
- index migration or sync approach.
- what business records should not be casually deleted.

### Automation

After local commands are stable, add:

- CI lint step.
- CI test step.
- dependency install reproducibility.
- branch or pull-request check if you use a remote repository.
- deployment command notes.

### RnD terms

- seed script
- admin bootstrap
- MongoDB Atlas network access
- database backup and restore
- health check
- reverse proxy
- HTTPS termination
- CI pipeline
- environment promotion

---

## 21. Phase-By-Phase Build Order

Use this as your working checklist.

### Phase 0: Workspace and notes

- [ ] Read the provided system design plan once end to end.
- [ ] Write your own stack decisions.
- [ ] Initialize Git.
- [ ] Create README and `.env.example`.
- [ ] Create an issue list or checklist for phases below.

Output:

- A clean empty backend repository with clear target and tooling decisions.

### Phase 1: Server skeleton

- [ ] Initialize Node project.
- [ ] Install core runtime and dev dependencies.
- [ ] Create `src` and `tests`.
- [ ] Split app construction and server startup.
- [ ] Add config validation.
- [ ] Add logger.
- [ ] Add database connector.
- [ ] Add `/health`.
- [ ] Add lint, format, test, dev, and start scripts.
- [ ] Write health test.

Output:

- A backend that starts, fails clearly on bad config, and can be tested.

### Phase 2: API base and safety

- [ ] Add `/api/v1` router.
- [ ] Add response conventions.
- [ ] Add central error handling.
- [ ] Add validation middleware.
- [ ] Add request ID and request logs.
- [ ] Add CORS allowlist.
- [ ] Add security headers.
- [ ] Add body-size limits.
- [ ] Add basic rate limiters.
- [ ] Document response and error conventions.

Output:

- A stable API shell for feature modules.

### Phase 3: Auth foundation

- [ ] Create User model.
- [ ] Create RefreshToken model.
- [ ] Add registration validation and route.
- [ ] Add login validation and route.
- [ ] Add bcrypt password handling.
- [ ] Add access token issuing.
- [ ] Add refresh cookie issuing.
- [ ] Add refresh route with rotation.
- [ ] Add logout and revocation behavior.
- [ ] Add auth middleware.
- [ ] Add role middleware.
- [ ] Add auth tests.
- [ ] Add auth docs to OpenAPI or notes.

Output:

- Customers and admins can authenticate with tested token behavior.

### Phase 4: Auth recovery and security polish

- [ ] Add forgot-password request flow.
- [ ] Add reset-password flow.
- [ ] Add development mail provider config.
- [ ] Add token hashing and expiry for reset.
- [ ] Invalidate sessions after password reset.
- [ ] Add optional email verification flow or record it as deferred.
- [ ] Tighten login and forgot-password rate limits.
- [ ] Write security notes on cookies and CSRF.

Output:

- Auth is usable beyond the happy path.

### Phase 5: Product catalogue

- [ ] Create Product model and indexes.
- [ ] Add public product list.
- [ ] Add product detail by slug.
- [ ] Add filtering, sorting, search, and pagination rules.
- [ ] Add admin product create.
- [ ] Add admin product update.
- [ ] Add active/inactive handling.
- [ ] Add seed data for local product-list and stock tests.
- [ ] Add product tests.
- [ ] Document product endpoints.

Output:

- Public catalogue and admin product management exist.

### Phase 6: Cart and inventory

- [ ] Create Cart model.
- [ ] Add cart retrieval.
- [ ] Add add-item operation.
- [ ] Add update-quantity operation.
- [ ] Add remove-item operation.
- [ ] Add clear-cart operation.
- [ ] Check stock on cart quantity increases.
- [ ] Add admin stock adjustment route.
- [ ] Decide audit-log scope for adjustments.
- [ ] Add cart and stock tests.

Output:

- Authenticated users can assemble carts against real inventory rules.

### Phase 7: Orders, checkout, and idempotency

- [ ] Create Order model.
- [ ] Create Payment model.
- [ ] Create IdempotencyKey model and TTL behavior.
- [ ] Set up transaction-capable MongoDB locally.
- [ ] Define totals calculation rules.
- [ ] Define order number generation strategy.
- [ ] Build checkout validator.
- [ ] Build checkout service using a transaction.
- [ ] Atomically enforce stock availability.
- [ ] Snapshot order items.
- [ ] Create payment record.
- [ ] Clear cart only in successful transaction flow.
- [ ] Cache or replay idempotent checkout response.
- [ ] Write rollback, duplicate-retry, and concurrency tests.

Output:

- Checkout behaves correctly under retries and competing buyers.

### Phase 8: Order APIs

- [ ] Add list-own-orders endpoint.
- [ ] Add own-order-detail endpoint.
- [ ] Add admin order list.
- [ ] Add allowed admin status transitions.
- [ ] Add ownership and role tests.
- [ ] Document order endpoints and status meanings.

Output:

- Orders can be viewed and managed according to ownership and role.

### Phase 9: Payment webhook flow

- [ ] Add mock payment provider behavior.
- [ ] Add webhook route with raw-body handling.
- [ ] Add signature verification.
- [ ] Add webhook event idempotency.
- [ ] Update payment and order status on success.
- [ ] Compensate inventory or release reservation on failure.
- [ ] Add webhook tests.
- [ ] Document webhook contract.

Output:

- Payment lifecycle is represented without hiding asynchronous complexity.

### Phase 10: Product images

- [ ] Add upload middleware configuration.
- [ ] Add file limits.
- [ ] Add type allowlist.
- [ ] Add real-content validation research and implementation.
- [ ] Add Cloudinary or S3 upload adapter.
- [ ] Save image metadata on Product.
- [ ] Add delete-image behavior.
- [ ] Add upload tests.
- [ ] Document storage choice and signed URL concept.

Output:

- Admins can manage product images through the API safely.

### Phase 11: Docs and developer experience

- [ ] Finish OpenAPI schemas and endpoint examples.
- [ ] Mount Swagger UI.
- [ ] Export Postman collection.
- [ ] Add environment template.
- [ ] Document first-admin bootstrap and seed commands.
- [ ] Expand README setup and demo flow.
- [ ] Add curl examples only where they help.
- [ ] Record limitations and stretch goals.

Output:

- Another developer can run and use the API without reading every service.

### Phase 12: Hardening and release readiness

- [ ] Run full lint and test suite.
- [ ] Recheck env contract.
- [ ] Recheck sensitive logs and responses.
- [ ] Recheck all write routes for auth and validation.
- [ ] Recheck indexes against real queries.
- [ ] Recheck error codes and docs consistency.
- [ ] Add CI checks once commands are stable.
- [ ] Document production env, database, CORS, cookies, upload, mail, health, and backup expectations.
- [ ] Add Docker only when it improves setup or deployment clarity.

Output:

- A backend portfolio project you can demo and explain.

---

## 22. Endpoint Checklist

### System

- [ ] `GET /health`
- [ ] `GET /docs`

### Auth

- [ ] `POST /api/v1/auth/register`
- [ ] `POST /api/v1/auth/login`
- [ ] `POST /api/v1/auth/refresh`
- [ ] `POST /api/v1/auth/logout`
- [ ] `POST /api/v1/auth/forgot-password`
- [ ] `POST /api/v1/auth/reset-password`
- [ ] `POST /api/v1/auth/verify-email` if included
- [ ] `GET /api/v1/auth/me`

### Users

- [ ] `GET /api/v1/users/me`
- [ ] `PATCH /api/v1/users/me`

### Products

- [ ] `GET /api/v1/products`
- [ ] `GET /api/v1/products/:slug`

### Cart

- [ ] `GET /api/v1/cart`
- [ ] `POST /api/v1/cart/items`
- [ ] `PATCH /api/v1/cart/items/:productId`
- [ ] `DELETE /api/v1/cart/items/:productId`
- [ ] `DELETE /api/v1/cart`

### Checkout and orders

- [ ] `POST /api/v1/checkout`
- [ ] `GET /api/v1/orders`
- [ ] `GET /api/v1/orders/:id`

### Payments

- [ ] `POST /api/v1/payments/webhook`

### Admin

- [ ] `GET /api/v1/admin/users`
- [ ] `PATCH /api/v1/admin/users/:id`
- [ ] `POST /api/v1/admin/products`
- [ ] `PATCH /api/v1/admin/products/:id`
- [ ] `DELETE /api/v1/admin/products/:id` or explicit deactivate behavior
- [ ] `PATCH /api/v1/admin/products/:id/stock`
- [ ] `POST /api/v1/admin/products/:id/images`
- [ ] `DELETE /api/v1/admin/products/:id/images/:imageId`
- [ ] `GET /api/v1/admin/orders`
- [ ] `PATCH /api/v1/admin/orders/:id/status`

---

## 23. Feature Definition Of Done

For every feature, do not call it finished until:

- [ ] Route is mounted.
- [ ] Input is validated.
- [ ] Authentication and authorization are correct.
- [ ] Service behavior is separated from controller plumbing.
- [ ] Database fields and indexes support the feature.
- [ ] Error cases return expected API errors.
- [ ] Logs do not leak secrets.
- [ ] Integration tests cover important behavior.
- [ ] OpenAPI or Postman docs are updated.
- [ ] README is updated if setup or env values changed.

---

## 24. RnD Backlog By Topic

Use this as your search list while building.

### Node and Express

- Express request lifecycle
- Express middleware order
- centralized error handling in Express
- async error propagation
- Express app testing with Supertest
- graceful shutdown Node.js

### MongoDB and Mongoose

- MongoDB replica set transactions
- Mongoose sessions
- Mongoose indexes
- Mongoose `select: false`
- Mongoose schema validation vs API validation
- compound indexes and query patterns
- TTL indexes
- embedded vs referenced data in MongoDB

### Auth and security

- bcrypt cost factor
- JWT access token best practices
- refresh token rotation
- token reuse detection
- HTTP-only cookie security
- SameSite cookie behavior
- CSRF with cookie authentication
- CORS with credentials
- OWASP API Security Top 10
- rate limiting API login

### E-commerce domain

- product catalogue filtering
- inventory reservation
- stock decrement race condition
- immutable order line item snapshot
- order status transition
- payment webhook retries
- refund idempotency
- minor units money storage

### Files and docs

- Multer memory storage
- MIME type spoofing and magic bytes
- Cloudinary upload stream
- S3 presigned URLs
- OpenAPI components schemas
- Postman collection variables

---

## 25. Common Mistakes To Avoid

- Starting with all folders and no running endpoint.
- Putting database operations directly in route handlers.
- Trusting totals or role values from request body.
- Storing decimal money values casually.
- Returning password hashes, reset token hashes, or refresh-token data.
- Using a standalone MongoDB server and assuming transactions work.
- Reading stock, checking it, then writing stock without handling concurrency.
- Treating cart as a completed order.
- Processing duplicate webhooks as new events.
- Forgetting idempotency for checkout retries.
- Uploading files without size and content checks.
- Adding docs only after all code drifts away from the real API.
- Skipping unhappy-path tests because Postman happy path worked once.

---

## 26. Final Demo Flow

When the project is complete, you should be able to demo this sequence:

1. Start the API with documented environment variables.
2. Open Swagger docs and show the response conventions.
3. Register a customer and log in.
4. Log in as admin and create a product.
5. Adjust stock for that product.
6. Upload a product image.
7. Browse the public product list.
8. Add product to customer cart.
9. Checkout with an idempotency key.
10. Repeat the same checkout request and prove no duplicate order appears.
11. Trigger mock payment success webhook.
12. Show order moving to paid.
13. Trigger a protected admin route as customer and show access is denied.
14. Run tests showing concurrency, webhook signature checks, and auth behavior.

If you can explain every step in that demo, including why the security and consistency rules exist, the project has done its job.

---

## 27. Stretch Goals After Core Completion

Only start these after the core checklist is green:

- MFA with TOTP.
- coupon and promotion rules.
- tax calculation abstraction.
- shipping rate abstraction.
- wishlists.
- product reviews with moderation.
- refund flow.
- outbound order notifications.
- queues for email and webhook retries.
- Redis caching for catalogue reads.
- Docker Compose with MongoDB replica-set setup.
- CI pipeline for lint and tests.
- observability with metrics and traces.
