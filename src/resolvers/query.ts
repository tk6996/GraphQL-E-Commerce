import User from "../models/user";
import Product from "../models/product";

const Query = {
  user: async (parent: any, args: any, context: any, info: any) => {
    const { userId } = context;
    if (!userId) throw new Error("Please log in");

    return await User.findById(userId)
      .populate({
        path: "products",
        populate: { path: "user" },
      })
      .populate({
        path: "carts",
        populate: { path: "product" },
      });
  },

  users: (parent: any, args: any, context: any, info: any) =>
    User.find()
      .populate({
        path: "products",
        option: { sort: { createAt: "desc" } },
        populate: { path: "user" },
      })
      .populate({
        path: "carts",
        populate: { path: "product" },
      }),

  product: (parent: any, args: any, context: any, info: any) =>
    Product.findById(args.id).populate({
      path: "user",
      populate: { path: "products" },
    }),

  products: (parent: any, args: any, context: any, info: any) =>
    Product.find()
      .populate({
        path: "user",
        populate: { path: "products" },
      })
      .sort({ createAt: "desc" }),
};

export default Query;
