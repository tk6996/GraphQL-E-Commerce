import User from "../models/user";
import jwt from "jsonwebtoken";

export const facebookAuth = async (req: any, res: any) => {
  try {
    const {
      id,
      name: { givenName },
      emails: [{ value }],
    } = req.user;

    let token;

    const user = await User.findOne({ providerId: id });

    if (!user) {
      const newUserData: any = {
        name: givenName,
        email: value,
        password: `facebook_${id}`,
        providerId: id,
      };
      const newUser = await User.create(newUserData);

      token = jwt.sign({ userId: newUser.id }, String(process.env.SECRET), {
        expiresIn: "7days",
      });
    } else {
      token = jwt.sign({ userId: user.id }, String(process.env.SECRET), {
        expiresIn: "7days",
      });
    }
    res.cookie("jwt", token);
    res.redirect("http://localhost:3000/products");
  } catch (error) {
    console.error(error);
    res.redirect("http://localhost:3000/signin");
  }
};

export const googleAuth = async (req: any, res: any) => {
    try {
      const {
        id,
        name: { givenName },
        emails: [{ value }],
      } = req.user;
  
      let token;
  
      const user = await User.findOne({ providerId: id });
  
      if (!user) {
        const newUserData: any = {
          name: givenName,
          email: value,
          password: `google_${id}`,
          providerId: id,
        };
        const newUser = await User.create(newUserData);
  
        token = jwt.sign({ userId: newUser.id }, String(process.env.SECRET), {
          expiresIn: "7days",
        });
      } else {
        token = jwt.sign({ userId: user.id }, String(process.env.SECRET), {
          expiresIn: "7days",
        });
      }
      res.cookie("jwt", token);
      res.redirect("http://localhost:3000/products");
    } catch (error) {
      console.error(error);
      res.redirect("http://localhost:3000/signin");
    }
  };
  