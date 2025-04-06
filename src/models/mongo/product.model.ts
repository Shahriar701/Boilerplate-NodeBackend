import { IProduct } from "@/interfaces/DbInterfaces";
import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
            trim: true,
        },
        price: {
            type: Number,
            required: false,
            default: 0,
        },
        inventory: {
            type: Number,
            required: false,
            default: 0,
        },
        isFeatured: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
        versionKey: false,
    }
);

// Create and export the Product model
export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema); 