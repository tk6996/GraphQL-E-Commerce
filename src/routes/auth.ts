import { Router } from "express";
import passport from "passport";
import { facebookAuth , googleAuth } from "../utils/socialProvidersAuth";
const router = Router();

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: "http://localhost:3000/signin",
  }),
  facebookAuth
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:3000/signin",
  }),
  googleAuth
);

export default router;
