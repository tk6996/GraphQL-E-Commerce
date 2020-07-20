import mongoose from "mongoose";
import { IProductSchema } from "./product";
import { ICartItemSchema } from "./cartItem";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  resetPasswordToken: { type: String },
  resetTokenExpiry: { type: Number },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  carts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CartItem",
    },
  ],
  createAt: { type: Date, required: true, default: () => Date.now() },
});

export interface IUserSchema extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  resetPasswordToken?: string;
  resetTokenExpiry?: number;
  products: IProductSchema[];
  carts: ICartItemSchema[];
  createAt?: Date;
}

const User = mongoose.model<IUserSchema>("User", userSchema);

export default User;
