import express from "express";
import pkg from "express-openid-connect";
const { requiresAuth } = pkg;
import {
  registerStudentProfile,
  userRegister,
  getStudentProfile,
  updateStudentProfile,
  addEducationDetails,
  getEducationDetails,
  updateEducationDetails,
  deleteEducationDetails,
  getAchievementDetails,
  addAchievementDetails,
  updateAchievementDetails,
  deleteAchievementDetails,
  addProjectDetails,
  updateProjectDetails,
  getProjectDetails,
  deleteProjectDetails,
  addInternshipDetails,
  getInternshipDetails,
  updateInternshipDetails,
  deleteInternshipDetails,
} from "../controllers/student.controller.js";

const studentRouter = express.Router();
studentRouter.use(express.json());

//User registration
studentRouter.post("/registerUser", userRegister);

// STUDENT PROFILE REGISTRATION ROUTES
studentRouter.get("/profile", requiresAuth(), getStudentProfile);
studentRouter.post("/registerStudent", requiresAuth(), registerStudentProfile);
studentRouter.put("/editProfile", requiresAuth(), updateStudentProfile);

// Education routes
studentRouter.get("/education", requiresAuth(), getEducationDetails);
studentRouter.post("/addEducation", requiresAuth(), addEducationDetails);
studentRouter.put("/editEducation", requiresAuth(), updateEducationDetails);
studentRouter.delete("/education", requiresAuth(), deleteEducationDetails);

//ACHIEVEMENT ROUTES
studentRouter.get("/achievement", requiresAuth(), getAchievementDetails);
studentRouter.post("/addAchievement", requiresAuth(), addAchievementDetails);
studentRouter.put(
  "/editAchievement/:achievementID",
  requiresAuth(),
  updateAchievementDetails
);
studentRouter.delete(
  "/achievement/:achievementID",
  requiresAuth(),
  deleteAchievementDetails
);

// //PROJECT ROUTES
studentRouter.get("/project", requiresAuth(), getProjectDetails);
studentRouter.post("/addProject", requiresAuth(), addProjectDetails);
studentRouter.put(
  "/editProject/:projectID",
  requiresAuth(),
  updateProjectDetails
);
studentRouter.delete(
  "/project/:projectID",
  requiresAuth(),
  deleteProjectDetails
);

// //INTERNSHIP ROUTES
studentRouter.get("/internship", requiresAuth(), getInternshipDetails);
studentRouter.post("/addInternship", requiresAuth(), addInternshipDetails);
studentRouter.put(
  "/internship/:internshipID",
  requiresAuth(),
  updateInternshipDetails
);
studentRouter.delete(
  "/internship/:internshipID",
  requiresAuth(),
  deleteInternshipDetails
);

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
