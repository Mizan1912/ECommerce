/**
 * Seeds products from a local JSON file.
 *
 * Usage:
 *   npm run seed:json [path/to/products.json]
 *
 * Example:
 *   npm run seed:json products.json
 */
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import connectDB from "../config/db.js";
import Product from "../models/Product.model.js";

const run = async () => {
    // 1. Determine JSON file path
    const args = process.argv.slice(2);
    const jsonRelativePath = args[0] || "products.json";
    const jsonAbsolutePath = path.resolve(process.cwd(), jsonRelativePath);

    console.log(`Checking for JSON file at: ${jsonAbsolutePath}`);

    if (!fs.existsSync(jsonAbsolutePath)) {
        console.error(`Error: File not found at ${jsonAbsolutePath}`);
        console.log(`Please create this file or supply the correct path as an argument.`);
        process.exit(1);
    }

    // 2. Read and parse JSON content
    let productsData;
    try {
        const rawContent = fs.readFileSync(jsonAbsolutePath, "utf-8");
        productsData = JSON.parse(rawContent);
    } catch (parseError) {
        console.error("Failed to parse JSON file:", parseError.message);
        process.exit(1);
    }

    if (!Array.isArray(productsData)) {
        console.error("Error: The JSON file must contain an array of products.");
        process.exit(1);
    }

    console.log(`Found ${productsData.length} products in JSON file. Starting seeding...`);

    // 3. Connect to database
    await connectDB();

    let createdCount = 0;
    let updatedCount = 0;

    for (const item of productsData) {
        // Normalise fields (e.g., support 'Category' or 'category', validate required fields)
        const title = item.title || item.name;
        const description = item.description;
        const category = item.category || item.Category;
        const price = item.price !== undefined ? Number(item.price) : undefined;
        const stock = item.stock !== undefined ? Number(item.stock) : 0;
        const isActive = item.isActive !== undefined ? Boolean(item.isActive) : true;
        const images = Array.isArray(item.images) ? item.images : [];

        if (!title || !description || !category || price === undefined) {
            console.warn(`Skipping invalid item (missing required fields): ${JSON.stringify(item)}`);
            continue;
        }

        const normalizedData = {
            title,
            description,
            category: category.toLowerCase(),
            price,
            stock,
            isActive,
            images,
        };

        try {
            // Find existing product with the same title
            const existingProduct = await Product.findOne({ title });
            if (existingProduct) {
                Object.assign(existingProduct, normalizedData);
                await existingProduct.save();
                updatedCount++;
            } else {
                await Product.create(normalizedData);
                createdCount++;
            }
        } catch (dbError) {
            console.error(`Failed to save product "${title}":`, dbError.message);
        }
    }

    console.log(`Seeding summary:`);
    console.log(`- Created: ${createdCount} products`);
    console.log(`- Updated: ${updatedCount} products`);

    await mongoose.connection.close();
    process.exit(0);
};

run().catch(async (error) => {
    console.error("Seeding crashed:", error);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
});
