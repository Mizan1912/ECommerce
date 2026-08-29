import User from "../../../models/User.model.js";
import Order from "../../../models/Order.model.js";
import Product from "../../../models/Product.model.js";
import ApiError from "../../../utils/ApiError.js";
import cloudinary from "../../../providers/cloudinary.provider.js";
import { Readable } from 'stream';

export const listUsers = async () => {
    return User.find({}).sort("-createdAt");
};

export const updateUser = async (userId, updateData) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (updateData.role !== undefined) {
        user.role = updateData.role;
    }
    await user.save();
    return user;
};

export const listOrders = async () => {
    return Order.find({})
        .populate("user", "name email")
        .sort("-createdAt");
};

export const adjustProductStock = async (productId, delta) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    product.stock += delta;
    if (product.stock < 0) {
        throw new ApiError(400, "Product stock cannot be negative");
    }

    await product.save();
    return product;
};

const uploadToCloudinary = (fileBuffer, folder = 'products') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        Readable.from(fileBuffer).pipe(uploadStream);
    });
};

export const uploadProductImages = async (productId, files) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (!files || files.length === 0) {
        throw new ApiError(400, "No files uploaded");
    }

    const uploadedImages = [];
    for (const file of files) {
        try {
            // Upload to Cloudinary
            const result = await uploadToCloudinary(file.buffer);
            const imageMetadata = {
                url: result.secure_url,
                publicId: result.public_id,
                isPrimary: product.images.length === 0 && uploadedImages.length === 0 // Mark first image as primary
            };
            product.images.push(imageMetadata);
            uploadedImages.push(imageMetadata);
        } catch (error) {
            console.error("Cloudinary upload failed:", error);
            throw new ApiError(500, "Failed to upload image to Cloudinary");
        }
    }

    await product.save();
    return product;
};

export const deleteProductImage = async (productId, imageId) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const imageIndex = product.images.findIndex(img => img._id.toString() === imageId || img.publicId === imageId);
    if (imageIndex === -1) {
        throw new ApiError(404, "Image not found on product");
    }

    const image = product.images[imageIndex];

    try {
        // Delete from Cloudinary
        if (image.publicId && !image.publicId.startsWith("mock")) {
            await cloudinary.uploader.destroy(image.publicId);
        }
    } catch (error) {
        console.error("Failed to delete from Cloudinary:", error);
        // Continue to delete from DB even if Cloudinary delete fails
    }

    product.images.splice(imageIndex, 1);
    await product.save();
    return product;
};
