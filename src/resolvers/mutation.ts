import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import sgMail from "@sendgrid/mail";

import {
  retrieveCustomer,
  createCustomer,
  createChargeCredit,
  createChargeInternetBanking,
  IChargesObject,
} from "../utils/omiseUtils";
import User, { IUserSchema } from "../models/user";
import Product, { IProductSchema } from "../models/product";
import CartItem, { ICartItemSchema } from "../models/cartItem";
import OrderItem, { IOrderItemSchema } from "../models/orderItem";
import Order, { IOrderSchema } from "../models/order";

const Mutation = {
  signup: async (_parent: any, args: any, _context: any, _info: any) => {
    const name: string = args.name;
    const email: string = args.email.trim().toLowerCase();
    const currentUsers = await User.find({});
    const isEmailExist =
      currentUsers.findIndex((user) => user.email === email) > -1;

    if (isEmailExist) throw new Error("Email already exist.");

    if (args.password.trim().length < 6)
      throw new Error("Password must be at least 6 characters.");

    const password: string = await bcrypt.hash(args.password, 10);

    return User.create<Pick<IUserSchema, "name" | "email" | "password">>({
      name,
      email,
      password,
    });
  },

  login: async (_parent: any, args: any, _context: any, _info: any) => {
    const { email, password } = args;

    const user = await User.findOne({ email })
      .populate({
        path: "products",
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

    if (!user) throw new Error("Email not found, please sign up.");

    const vaildPassword = await bcrypt.compare(password, user.password);

    if (!vaildPassword) throw new Error("Invalid email or password.");

    const token = jwt.sign({ userId: user.id }, process.env.SECRET!, {
      expiresIn: "7days",
    });

    return { user: user, jwt: token };
  },

  requestResetPassword: async (
    _parent: any,
    args: any,
    _context: any,
    _info: any
  ) => {
    const { email } = args;
    const user = await User.findOne({ email });
    if (!user) throw new Error("Email not found, please sign up instead.");

    const resetPasswordToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 30 * 60 * 1000;

    await User.findByIdAndUpdate(user.id, {
      resetPasswordToken,
      resetTokenExpiry,
    });

    sgMail.setApiKey(process.env.API_KEY_SENT_GRID!);

    const message = {
      from: process.env.MY_EMAIL!,
      to: user.email,
      subject: "Reset password link",
      html: `
        <div>
          <p>Please click the link below to reset your password.</p><br/><br/>
        <a href="http://localhost:3000/signin/resetpassword?resetPasswordToken=${resetPasswordToken}" target="blank" style="color:blue">"Click to reset your password"</a>
        </div>
      `,
    };

    sgMail.send(message);
    return { message: "Please check your email to proceed reset password." };
  },

  resetPassword: async (_parent: any, args: any, _context: any, _info: any) => {
    const { password, token } = args;

    if (password.trim().length < 6)
      throw new Error("Password must be at least 6 characters.");

    const user = await User.findOne({ resetPasswordToken: token });

    if (!user) throw new Error("Invalid token, cannot reset password.");

    const isTokenExpired =
      user.resetTokenExpiry && user.resetTokenExpiry < Date.now();
    if (isTokenExpired)
      throw new Error("Invalid token, cannot reset password.");

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(user.id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetTokenExpiry: undefined,
    });

    return {
      message: "You have successfully reset your password, please sign in.",
    };
  },

  createProduct: async (_parent: any, args: any, context: any, _info: any) => {
    const { userId }: { userId: string } = context;

    const user = await User.findById(userId);

    if (!user) throw new Error("Please log in.");

    const {
      description,
      price,
      imageUrl,
    }: { description: string; price: number; imageUrl: string } = args;

    if (price < 0) throw new Error("Price must is positive number.");

    if (!description || !price || !imageUrl)
      throw new Error("Please enter all required fields.");

    const product = await Product.create<
      Pick<IProductSchema, "description" | "price" | "imageUrl" | "user">
    >({
      description,
      price,
      imageUrl,
      user,
    });

    if (!user.products) user.products = [product];
    else user.products.push(product);

    await user.save();

    return await Product.findById(product.id).populate({
      path: "user",
      populate: { path: "products" },
    });
  },

  updateProduct: async (_parent: any, args: any, context: any, _info: any) => {
    const { userId } = context;
    if (!userId) throw new Error("Please log in.");

    const { id, description, price, imageUrl } = args;

    if (price < 0) throw new Error("Price must is positive number.");

    const product = await Product.findById(id);
    if (!product) throw new Error("Product has not found.");

    if (userId !== product.user.toString())
      throw new Error("You are not authorized.");

    const updateInfo = {
      description: description || product.description,
      price: price || product.price,
      imageUrl: imageUrl || product.imageUrl,
    };

    await Product.findByIdAndUpdate(id, updateInfo);

    const updateProduct = await Product.findById(id).populate({
      path: "user",
    });

    return updateProduct;
  },

  deleteProduct: async (_parent: any, args: any, context: any, _info: any) => {
    const { id }: { id: string } = args;
    const product = await Product.findById(id);
    if (!product) throw new Error("Product id invalid.");

    const { userId } = context;
    if (!userId) throw new Error("Please log in.");

    if (userId !== product.user.toString())
      throw new Error("You are not authorized.");

    const deleteProduct = await Product.findByIdAndDelete(product.id);
    if (!deleteProduct) throw new Error("Product has not found.");

    const user = await User.findById(userId);
    if (!user) throw new Error("User Not Found.");

    const updatedProducts = user.products.filter(
      (product) => product.toString() !== deleteProduct.id.toString()
    );

    await User.findByIdAndUpdate(userId, { products: updatedProducts });

    const carts = await CartItem.find({ product: deleteProduct });
    for (const cart of carts) {
      const deleteCart = await CartItem.findByIdAndDelete(cart.id);
      if (!deleteCart) throw new Error("CartItem has not found.");

      const user = await User.findById(deleteCart.user);
      if (!user) throw new Error("User Not Found.");

      const updatedUserCarts = user.carts.filter(
        (cartId) => cartId.toString() !== deleteCart.id.toString()
      );

      await User.findByIdAndUpdate(user.id, { carts: updatedUserCarts });
    }

    return deleteProduct;
  },

  addToCart: async (_parent: any, args: any, context: any, _info: any) => {
    const { id }: { id: string } = args;
    const { userId }: { userId: string } = context;
    if (!userId) throw new Error("Please log in.");

    try {
      const user = await User.findById(userId).populate({
        path: "carts",
        populate: { path: "product" },
      });
      if (!user) throw new Error("User Not Found.");

      const findCartItemIndex = user.carts.findIndex(
        (cartItem) => cartItem.product.id === id
      );

      if (findCartItemIndex > -1) {
        user.carts[findCartItemIndex].quantity += 1;

        await CartItem.findByIdAndUpdate(user.carts[findCartItemIndex].id, {
          quantity: user.carts[findCartItemIndex].quantity,
        });

        const updatedCartItem = await CartItem.findById(
          user.carts[findCartItemIndex].id
        )
          .populate({ path: "product" })
          .populate({ path: "user" });

        return updatedCartItem;
      } else {
        const product = await Product.findById(id);

        if (!product) throw new Error("Product id invalid.");

        const cartItem = await CartItem.create<
          Pick<ICartItemSchema, "product" | "quantity" | "user">
        >({
          product: product,
          quantity: 1,
          user: user,
        });

        const newCartItem = await CartItem.findById(cartItem.id)
          .populate({
            path: "product",
          })
          .populate({
            path: "user",
          });

        if (!newCartItem) throw new Error("Add new cartItem unsuccessful.");
        await User.findByIdAndUpdate(userId, {
          carts: [...user.carts, newCartItem],
        });
        return newCartItem;
      }
    } catch (error) {
      console.error(error);
    }
  },

  deleteCart: async (_parent: any, args: any, context: any, _info: any) => {
    const { id }: { id: string } = args;
    const { userId }: { userId: string } = context;
    if (!userId) throw new Error("Please log in.");

    const cart = await CartItem.findById(id);
    if (!cart) throw new Error("CartItem has not found.");

    const user = await User.findById(userId);
    if (!user) throw new Error("User Not Found.");

    if (userId !== cart.user.toString())
      throw new Error("You are not authorized.");

    const deleteCart = await CartItem.findByIdAndRemove(id);
    if (!deleteCart) throw new Error("CartItem has not found.");

    const updatedUserCarts = user.carts.filter(
      (cartId) => cartId.toString() !== deleteCart.id.toString()
    );

    await User.findByIdAndUpdate(userId, { carts: updatedUserCarts });

    return deleteCart;
  },

  createOrder: async (_parent: any, args: any, context: any, _info: any) => {
    const {
      amount,
      cardId,
      token,
      return_uri,
    }: {
      amount: number;
      cardId: string | null;
      token: string | null;
      return_uri: string | null;
    } = args;
    const { userId }: { userId: string } = context;
    if (!userId) throw new Error("Please log in.");

    const user = await User.findById(userId).populate({
      path: "carts",
      populate: { path: "product" },
    });
    if (!user) throw new Error("User Not Found.");

    let customer;

    if (cardId && !token && !return_uri) {
      const cust = await retrieveCustomer(cardId);
      if (!cust) throw new Error("Cannot process payment.");

      customer = cust;
    }

    if (!cardId && token && !return_uri) {
      const newCustomer = await createCustomer(token, user.email, user.name);
      if (!newCustomer) throw new Error("Cannot process payment.");

      customer = newCustomer;
      const {
        id,
        expiration_month,
        expiration_year,
        brand,
        last_digits,
      } = newCustomer.cards.data[0];

      const newCard = {
        id: newCustomer.id,
        cardInfo: {
          id,
          expiration_month,
          expiration_year,
          brand,
          last_digits,
        },
      };

      await User.findByIdAndUpdate(userId, {
        cards: !user.cards ? [newCard] : [newCard, ...user.cards],
      });
    }

    let charge: IChargesObject | null;
    if (token && return_uri) {
      charge = await createChargeInternetBanking(amount, token, return_uri);
    } else {
      charge = await createChargeCredit(amount, customer?.id);
    }
    if (!charge)
      throw new Error("Something went wrong with payment,please try again.");

    const convertCartToOrder = async () => {
      return Promise.all(
        user.carts.map((cart) =>
          OrderItem.create<
            Pick<IOrderItemSchema, "product" | "quantity" | "user">
          >({
            product: cart.product,
            quantity: cart.quantity,
            user: cart.user,
          })
        )
      );
    };

    const orderItemArray = await convertCartToOrder();

    const order = await Order.create<
      Pick<IOrderSchema, "user" | "items" | "authorize_uri">
    >({
      user,
      items: orderItemArray.map((orderItem) => orderItem.id),
      authorize_uri: charge.authorize_uri,
    });

    const deleteCartItems = async () => {
      return Promise.all(
        user.carts.map((cart) => CartItem.findByIdAndRemove(cart.id))
      );
    };

    await deleteCartItems();

    await User.findByIdAndUpdate(userId, {
      carts: [],
      orders: !user.orders ? [order] : [...user.orders, order],
    });

    return await Order.findById(order.id)
      .populate({ path: "user" })
      .populate({ path: "items", populate: { path: "product" } });
  },
};

export default Mutation;
