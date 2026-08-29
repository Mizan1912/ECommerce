/**
 * Creates (or repairs) the platform administrator account.
 *
 *   npm run seed:admin
 *
 * Credentials come from ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME in .env,
 * falling back to the defaults below. Running it again is safe: an existing
 * user with that email is promoted to admin, reactivated, and given the
 * configured password.
 */
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import connectDB from "../config/db.js";
import User from "../models/User.model.js";

const DEFAULTS = {
    name: "Store Admin",
    email: "admin@ecommerce.local",
    password: "Admin@12345",
};

const run = async () => {
    const name = process.env.ADMIN_NAME || DEFAULTS.name;
    const email = (process.env.ADMIN_EMAIL || DEFAULTS.email).toLowerCase();
    const password = process.env.ADMIN_PASSWORD || DEFAULTS.password;

    await connectDB();

    const hashedPassword = await bcrypt.hash(password, 12);
    const existing = await User.findOne({ email }).select("+password");

    if (existing) {
        existing.name = name;
        existing.role = "admin";
        existing.isActive = true;
        existing.password = hashedPassword;
        await existing.save();
        console.log(`Updated existing account to admin: ${email}`);
    } else {
        await User.create({ name, email, password: hashedPassword, role: "admin", isActive: true });
        console.log(`Created admin account: ${email}`);
    }

    console.log("--------------------------------------------");
    console.log(`  Email    : ${email}`);
    console.log(`  Password : ${password}`);
    console.log("--------------------------------------------");

    await mongoose.connection.close();
    process.exit(0);
};

run().catch(async (error) => {
    console.error("Admin seed failed:", error);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
});
