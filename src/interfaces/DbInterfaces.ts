import { Document } from "mongoose";

export interface IUser extends Document {
    email: string;
    name: string;
    password: string;
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IProduct extends Document {
    name: string;
    type: string;
    description?: string;
    price?: number;
    inventory?: number;
    isFeatured?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
