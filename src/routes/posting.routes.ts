import express from "express";
import { auth } from "express-oauth2-jwt-bearer";
import { getAllPostingDetails } from "../controllers/posting.controller.js";

const postingRouter = express.Router();

postingRouter.get("/", getAllPostingDetails);

export default postingRouter;
