import mongoose from "mongoose"
import Cart from "../../../models/Cart.model.js";
import Product from "../../../models/Product.model.js";
import ApiError from "../../../utils/ApiError.js";
import Order from "../../../models/Order.model.js";

export const checkout = async (userId) => {
    const session = await mongoose.startSession();

    session.startTransaction();

    try {
        const cart =
        await Cart.findOne({
            user: userId,
        }).populate(
            "items.product"
        );

        if (
        !cart ||
        cart.items.length === 0
        ) {
        throw new ApiError(
            400,
            "Cart is empty"
        );
        }

        let totalAmount = 0;
        const orderItems=[];

        for(const item of cart.items){
            const product=await Product.findById(
                item.product._id
            ).session(session);

            if(!product){
                throw new ApiError(
                    404,
                    "Product not found"
                )
            }

            if(product.stock<item.quantity){
                throw new ApiError(
                    400,
                    `Insufficient stock for ${product.title}`
                )
            }

            orderItems.push({
                product: product._id,

                title: product.title,

                quantity: item.quantity,

                price: item.priceSnapshot,
            })

            totalAmount+=item.quantity*item.priceSnapshot;

            const result =
            await Product.updateOne(
                {
                _id:
                    product._id,

                stock: {
                    $gte:
                    item.quantity,
                },
                },

                {
                $inc: {
                    stock:
                    -item.quantity,
                },
                },

                {
                session,
                }
            );

        if (result.modifiedCount === 0) {
            throw new ApiError(
                400,

                `Insufficient stock for ${product.title}`
            );
        }    
        }

        // for (const item of cart.items) {
        //     await Product.updateOne(
        //         {
        //         _id:
        //             item.product._id,
        //         },

        //         {
        //         $inc: {
        //             stock:
        //             -item.quantity,
        //         },
        //         },

        //         {
        //         session,
        //         }
        //     );
        // }

        

        const orderNumber =
             `ORD-${Date.now()}`;

        const order = await Order.create(
            [
                {
                    orderNumber,
                    user:userId,
                    items:orderItems,
                    totalAmount,
                    status:"pending",
                },
            ],{
                session,
            }
        )

        cart.items = [];
        await cart.save({
            session,
        })

        await session.commitTransaction();
        session.endSession();
        return order[0];
    } catch (error) {
        await session.abortTransaction();

        session.endSession();

        throw error;
    }
}
