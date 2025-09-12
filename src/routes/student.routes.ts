import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  registerStudentProfile,
  userRegister,
} from "../controllers/student.controller.js";

const studentRouter = express.Router();
studentRouter.use(express.json());

//User registration
studentRouter.post("/registerUser", userRegister);

//student registration
studentRouter.post("/registerStudent", registerStudentProfile);

// //PROFILE ROUTES
// studentRouter.get("/profile", middleware, getStudentProfile);
// studentRouter.post("/profile", middleware, cont_func);
// studentRouter.put("/profile", middleware, cont_func);

// //ACHIEVEMENT ROUTES
// studentRouter.get("/profile/achievement", middleware, cont_func);
// studentRouter.post("/profile/achievement", middleware, cont_func);
// studentRouter.put("/profile/achievement/:achievementID", middleware, cont_func);
// studentRouter.delete(
//   "profile/achievement/:achievementID",
//   middleware,
//   cont_func
// );

// //PROJECT ROUTES
// studentRouter.get("/profile/project", middleware, cont_func);
// studentRouter.post("/profile/project", middleware, cont_func);
// studentRouter.put("/profile/project/:projectID", middleware, cont_func);
// studentRouter.delete("profile/project/:projectID", middleware, cont_func);

// //INTERNSHIP ROUTES
// studentRouter.get("/profile/internship", middleware, cont_func);
// studentRouter.post("/profile/internship", middleware, cont_func);
// studentRouter.put("/profile/internship/:internshipID", middleware, cont_func);
// studentRouter.delete("profile/internship/:internshipID", middleware, cont_func);

// //Certificate Routes
// studentRouter.get("/profile/certificate", middleware, cont_func);
// studentRouter.post("/profile/certificate", middleware, cont_func);
// studentRouter.put("/profile/certificate/:certificateID", middleware, cont_func);
// studentRouter.delete(
//   "profile/certificate/:certificate:ID",
//   middleware,
//   cont_func
// );

// //SOCIAL ROUTES
// studentRouter.get("/profile/social", middleware, cont_func);
// studentRouter.post("/profile/social", middleware, cont_func);
// studentRouter.put("/profile/social/:socialID", middleware, cont_func);
// studentRouter.delete("profile/social/:socialID", middleware, cont_func);

// //APPLICATION ROUTE
// studentRouter.get("profile/applications", middleware, cont_func);

export default studentRouter;
