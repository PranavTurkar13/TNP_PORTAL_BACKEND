import express from "express";
//User Controller
import { userRegister } from "../controllers/studentControllers/user.controller.js";

const userRouter = express.Router();
userRouter.use(express.json());

userRouter.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
//User registration
userRouter.post("/registerUser", userRegister);

export default userRouter;
