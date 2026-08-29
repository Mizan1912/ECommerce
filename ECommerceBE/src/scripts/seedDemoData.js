/**
 * Seeds demo catalogue data plus a sample customer and orders so the admin
 * panel has something to render immediately.
 *
 *   npm run seed:demo
 *
 * Existing products with the same title are updated instead of duplicated.
 */
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import connectDB from "../config/db.js";
import User from "../models/User.model.js";
import Product from "../models/Product.model.js";
import Order from "../models/Order.model.js";
import Payment from "../models/Payment.model.js";

const DEMO_PRODUCTS = [
    {
        title: "Aero Knit Runner",
        description: "Lightweight daily trainers with breathable knit uppers and cushioned midsoles.",
        category: "footwear",
        price: 7499,
        stock: 18,
    },
    {
        title: "Metro Carry Tote",
        description: "Structured everyday tote with a padded laptop sleeve and recycled canvas body.",
        category: "bags",
        price: 3899,
        stock: 32,
    },
    {
        title: "Pulse Wireless Headphones",
        description: "Over-ear wireless headphones with adaptive noise cancelling and 40 hour battery.",
        category: "audio",
        price: 12999,
        stock: 4,
    },
    {
        title: "Fold Desk Lamp",
        description: "Minimal aluminium desk lamp with stepless dimming and a warm-to-cool range.",
        category: "desk",
        price: 2499,
        stock: 0,
    },
    {
        title: "Trail Weekender Duffel",
        description: "Water resistant 40L duffel with a separate shoe compartment for weekend trips.",
        category: "bags",
        price: 5499,
        stock: 12,
    },
];

const run = async () => {
    await connectDB();

    const products = [];
    for (const data of DEMO_PRODUCTS) {
        const product = await Product.findOne({ title: data.title });
        if (product) {
            Object.assign(product, data);
            await product.save();
            products.push(product);
        } else {
            products.push(await Product.create(data));
        }
    }
    console.log(`Seeded ${products.length} products.`);

    const customerEmail = "customer@ecommerce.local";
    let customer = await User.findOne({ email: customerEmail });
    if (!customer) {
        customer = await User.create({
            name: "Demo Customer",
            email: customerEmail,
            password: await bcrypt.hash("Customer@12345", 12),
            role: "customer",
        });
    }
    console.log(`Demo customer ready: ${customerEmail} / Customer@12345`);

    const orderSpecs = [
        { suffix: "0001", status: "paid", paymentStatus: "paid", items: [[0, 1], [1, 2]] },
        { suffix: "0002", status: "pending", paymentStatus: "pending", items: [[2, 1]] },
        { suffix: "0003", status: "shipped", paymentStatus: "paid", items: [[4, 1]] },
    ];

    for (const spec of orderSpecs) {
        const orderNumber = `EC-DEMO-${spec.suffix}`;
        const items = spec.items.map(([index, quantity]) => ({
            product: products[index]._id,
            title: products[index].title,
            quantity,
            price: products[index].price,
        }));
        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const existing = await Order.findOne({ orderNumber });
        if (existing) {
            console.log(`Order ${orderNumber} already exists, skipping.`);
            continue;
        }

        const order = await Order.create({
            orderNumber,
            user: customer._id,
            items,
            totalAmount,
            status: spec.status,
            paymentStatus: spec.paymentStatus,
            paidAt: spec.paymentStatus === "paid" ? new Date() : undefined,
        });

        await Payment.create({
            order: order._id,
            provider: "razorpay",
            providerOrderId: `order_demo_${spec.suffix}`,
            providerPaymentId: spec.paymentStatus === "paid" ? `pay_demo_${spec.suffix}` : undefined,
            amount: totalAmount,
            status: spec.paymentStatus === "paid" ? "paid" : "pending",
        });

        console.log(`Created order ${orderNumber}`);
    }

    await mongoose.connection.close();
    process.exit(0);
};

run().catch(async (error) => {
    console.error("Demo seed failed:", error);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
});
