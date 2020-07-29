import mongoose from "mongoose";
import { IUserSchema } from "./user";
import { IProductSchema } from "./product";

const orderItemSchema = new mongoose.Schema({
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

export interface IOrderItemSchema extends mongoose.Document {
  product: IProductSchema;
  quantity: number;
  user: IUserSchema;
  createAt: Date;
}

const OrderItem = mongoose.model<IOrderItemSchema>("OrderItem", orderItemSchema);

export default OrderItem;
