import  express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const adminRouter = express.Router();
adminRouter.use(express.json());


export default adminRouter;

