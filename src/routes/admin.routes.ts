import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  addPostingDetails,
  updatePostingDetails,
} from "../controllers/adminControllers/posting.controller.js";
import {
  addEligibilityCriteria,
  updateEligibilityCriteria,
  getEligibilityCriteria,
} from "../controllers/adminControllers/eligibility.controller.js";
import { createJobWithEligibility } from "../controllers/adminControllers/posting_and_eligi.controller.js";
import {
  getAdminProfile,
  upsertAdminProfile,
} from "../controllers/adminControllers/profile.controller.js";

const adminRouter = express.Router();
adminRouter.use(express.json());

//PROFILE
adminRouter.get("/profile", getAdminProfile);
adminRouter.post("/profile", upsertAdminProfile);
adminRouter.put("/profile", upsertAdminProfile);

//add status (like: active, inactive) to posting
adminRouter.post("/addPostingDetails", addPostingDetails);
adminRouter.put("/editPostingDetails", updatePostingDetails);

adminRouter.post("/addEligibilityCriteria", addEligibilityCriteria);
adminRouter.put("/editEligibilityCriteria", updateEligibilityCriteria);
adminRouter.get("/getEligibilityCriteria/:jobPostId", getEligibilityCriteria);

adminRouter.post("/createJobWithEligibility", createJobWithEligibility);

export default adminRouter;
