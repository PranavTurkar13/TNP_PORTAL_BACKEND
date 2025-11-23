import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { addPostingDetails, getPostingDetails, updatePostingDetails } from "../controllers/adminControllers/posting.controller.js";

const adminRouter = express.Router();
adminRouter.use(express.json());
//add status (like: active, inactive) to posting
adminRouter.get("/postings", getPostingDetails);
adminRouter.post("/addPostingDetails", addPostingDetails);
adminRouter.put("/editPostingDetails", updatePostingDetails);

export default adminRouter;

