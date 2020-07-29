import User from "../models/user";
import Product from "../models/product";

const Query = {
  user: (_parent: any, _args: any, context: any, _info: any) => {
    const { userId } = context;
    if (!userId) throw new Error("Please log in");

    return User.findById(userId)
      .populate({
        path: "products",
        option: { sort: { createAt: "desc" } },
        populate: { path: "user" },
      })
      .populate({
        path: "carts",
        populate: { path: "product" },
      })
      .populate({
        path: "orders",
        option: { sort: { createAt: "desc" } },
        populate: { path: "items", populate: { path: "product" } },
      });
  },

  // users: (_parent: any, _args: any, _context: any, _info: any) =>
  //   User.find()
  //     .populate({
  //       path: "products",
  //       option: { sort: { createAt: "desc" } },
  //       populate: { path: "user" },
  //     })
  //     .populate({
  //       path: "carts",
  //       populate: { path: "product" },
  //     })
  //     .populate({
  //       path: "orders",
  //       option: { sort: { createAt: "desc" } },
  //       populate: { path: "items", populate: { path: "product" } },
  //     }),

  product: (_parent: any, args: any, _context: any, _info: any) =>
    Product.findById(args.id).populate({
      path: "user",
      populate: { path: "products" },
    }),

  products: (_parent: any, _args: any, _context: any, _info: any) =>
    Product.find()
      .populate({
        path: "user",
        populate: { path: "products" },
      })
      .sort({ createAt: "desc" }),
};

export default Query;
