import mongoose from "mongoose";
import { IUserSchema } from "./user";
import { IOrderItemSchema } from "./orderItem";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
    },
  ],
  authorize_uri: { type: String },
  createAt: { type: Date, required: true, default: () => Date.now() },
});

export interface IOrderSchema extends mongoose.Document {
  user: IUserSchema;
  items: [IOrderItemSchema];
  authorize_uri?: string;
  createAt?: Date;
}

const Order = mongoose.model<IOrderSchema>("Order", orderSchema);

export default Order;
