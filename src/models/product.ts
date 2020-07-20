import mongoose from "mongoose";
import { IUserSchema } from "./user";

const productSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true, trim: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  createAt: { type: Date, required: true, default: () => Date.now() },
});

export interface IProductSchema extends mongoose.Document {
  description: string;
  price: number;
  imageUrl: string;
  user: IUserSchema;
  createAt?: Date;
}

const Product = mongoose.model<IProductSchema>("Product", productSchema);

export default Product;
