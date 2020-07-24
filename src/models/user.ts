import mongoose from "mongoose";
import { IProductSchema } from "./product";
import { ICartItemSchema } from "./cartItem";
import { IOrderSchema } from "./order";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  providerId: {
    type: String,
  },
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
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  cards: [
    {
      id: String,
      cardInfo: {
        id: String,
        expiration_month: Number,
        expiration_year: Number,
        brand: String,
        last_digits: String,
      },
    },
  ],
  createAt: { type: Date, required: true, default: () => Date.now() },
});

interface Card {
  id: string;
  cardInfo: CardInfo;
}

interface CardInfo {
  id: string;
  expiration_month: number;
  expiration_year: number;
  brand: string;
  last_digits: string;
}

export interface IUserSchema extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  providerId?: string;
  resetPasswordToken?: string;
  resetTokenExpiry?: number;
  products: IProductSchema[];
  carts: ICartItemSchema[];
  orders: IOrderSchema[];
  cards: Card[];
  createAt?: Date;
}

const User = mongoose.model<IUserSchema>("User", userSchema);

export default User;
