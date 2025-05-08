import { Document } from "mongoose";

export interface IUser extends Document {
    id: string;
    email: string;
    name: string;
    password: string;
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    roles?: string[];
}

export interface IProduct extends Document {
    id: string;
    name: string;
    type: string;
    description?: string;
    price?: number;
    inventory?: number;
    isFeatured?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Interface for DynamoDB without Mongoose Document properties
export interface IDynamoProduct {
    id: string;
    name: string;
    type: string;
    description?: string;
    price?: number;
    inventory?: number;
    isFeatured?: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
}
