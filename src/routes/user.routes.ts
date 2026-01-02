import express from "express";
//User Controller
import { userRegister } from "../controllers/studentControllers/user.controller.js";
import { getMe } from "../controllers/studentControllers/me.controller.js";
import { auth } from "express-oauth2-jwt-bearer";

const userRouter = express.Router();
userRouter.use(express.json());

const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE!,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN!}/`,
});

userRouter.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
//User registration
userRouter.post("/registerUser", userRegister);
userRouter.get("/me", checkJwt, getMe);

export default userRouter;
