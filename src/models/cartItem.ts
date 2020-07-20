import mongoose from "mongoose";
import { IUserSchema } from "./user";
import { IProductSchema } from "./product";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    require: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  createAt: { type: Date, required: true, default: () => Date.now() },
});

export interface ICartItemSchema extends mongoose.Document {
  product: IProductSchema;
  quantity: number;
  user: IUserSchema;
  createAt?: Date;
}

const CartItem = mongoose.model<ICartItemSchema>("CartItem", cartItemSchema);

export default CartItem;
