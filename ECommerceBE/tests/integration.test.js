import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import env from '../src/config/env.js';
import User from '../src/models/User.model.js';
import Product from '../src/models/Product.model.js';
import Cart from '../src/models/Cart.model.js';
import Order from '../src/models/Order.model.js';

describe('E-Commerce Backend Integration Tests', () => {
    let token;
    let testUserEmail = `test_${Date.now()}@example.com`;
    let userId;
    let product;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(env.MONGO_URI);
        }
        // Create a test product
        product = await Product.create({
            sku: `SKU-${Date.now()}`,
            slug: `test-product-${Date.now()}`,
            title: 'Test Product',
            description: 'This is a test product',
            category: 'Electronics',
            price: 1000,
            stock: 10,
            isActive: true
        });
    });

    afterAll(async () => {
        await User.deleteOne({ email: testUserEmail });
        await Product.deleteOne({ _id: product._id });
        if (userId) {
            await Cart.deleteOne({ user: userId });
            await Order.deleteMany({ user: userId });
        }
        await mongoose.connection.close();
    });

    test('GET /api/v1/health should return health check status', async () => {
        const res = await request(app).get('/api/v1/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('User Registration and Login', async () => {
        const registerRes = await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: 'Test User',
                email: testUserEmail,
                password: 'Password123!'
            });
        
        expect([200, 201]).toContain(registerRes.statusCode);

        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: testUserEmail,
                password: 'Password123!'
            });

        expect(loginRes.statusCode).toBe(200);
        expect(loginRes.body.data).toHaveProperty('accessToken');
        token = loginRes.body.data.accessToken;

        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = decoded.userId;
    });

    test('Cart Operations & Idempotency Checkout & Stock Restoration', async () => {
        // 1. Add item to cart
        const cartRes = await request(app)
            .post('/api/v1/cart')
            .set('Authorization', `Bearer ${token}`)
            .send({
                productId: product._id.toString(),
                quantity: 2
            });

        expect(cartRes.statusCode).toBe(200);

        // 2. Verify stock is still 10 (cart does not reserve stock)
        let freshProduct = await Product.findById(product._id);
        expect(freshProduct.stock).toBe(10);

        // 3. Checkout with Idempotency Key
        const idempotencyKey = `idemp-${Date.now()}`;
        const checkoutRes1 = await request(app)
            .post('/api/v1/checkout')
            .set('Authorization', `Bearer ${token}`)
            .set('idempotency-key', idempotencyKey)
            .send({});

        expect(checkoutRes1.statusCode).toBe(201);
        expect(checkoutRes1.body.success).toBe(true);
        const orderNumber = checkoutRes1.body.data.order.orderNumber;
        expect(orderNumber).toBeDefined();

        // 4. Verify stock is decremented to 8 (2 units reserved/checked out)
        freshProduct = await Product.findById(product._id);
        expect(freshProduct.stock).toBe(8);

        // 5. Retry same checkout with same Idempotency Key (should replay response)
        const checkoutRes2 = await request(app)
            .post('/api/v1/checkout')
            .set('Authorization', `Bearer ${token}`)
            .set('idempotency-key', idempotencyKey)
            .send({});

        expect(checkoutRes2.statusCode).toBe(201);
        expect(checkoutRes2.body.data.order.orderNumber).toBe(orderNumber);

        // 6. Verify stock is STILL 8 (did not decrement again)
        freshProduct = await Product.findById(product._id);
        expect(freshProduct.stock).toBe(8);

        // 7. Retry same key with a different body (should reject 422)
        const checkoutRes3 = await request(app)
            .post('/api/v1/checkout')
            .set('Authorization', `Bearer ${token}`)
            .set('idempotency-key', idempotencyKey)
            .send({ differentField: true });

        expect(checkoutRes3.statusCode).toBe(422);

        // 8. Cancel order & verify stock is restored to 10
        const cancelRes = await request(app)
            .post(`/api/v1/orders/${orderNumber}/cancel`)
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(cancelRes.statusCode).toBe(200);
        expect(cancelRes.body.success).toBe(true);

        freshProduct = await Product.findById(product._id);
        expect(freshProduct.stock).toBe(10);
    });

    test('Webhook Signature Verification', async () => {
        // Bad signature should fail
        const webhookRes = await request(app)
            .post('/api/v1/payments/webhook')
            .set('x-razorpay-signature', 'bad_sig')
            .send({ event: 'payment.captured' });

        expect(webhookRes.statusCode).toBe(401);
    });
});
