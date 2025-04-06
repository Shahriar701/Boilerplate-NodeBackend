import { IUser } from "@/interfaces/DbInterfaces";
import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    versionKey: false,
  }
);

// Create and export the User model
export const UserModel = mongoose.model<IUser>('User', UserSchema); 