import express from "express";
import pkg from "express-openid-connect";
const { requiresAuth } = pkg;
//User Controller
import { userRegister } from "../controllers/studentControllers/user.controller.js";
//Profile Controller
import {
  getStudentProfile,
  registerStudentProfile,
  updateStudentProfile,
} from "../controllers/studentControllers/profile.controller.js";
//Education Controller
import {
  addEducationDetails,
  getEducationDetails,
  updateEducationDetails,
  deleteEducationDetails,
} from "../controllers/studentControllers/education.controller.js";
//Achievement Controller
import {
  addAchievementDetails,
  getAchievementDetails,
  updateAchievementDetails,
  deleteAchievementDetails,
} from "../controllers/studentControllers/achievement.controller.js";
//Project Controller
import {
  addProjectDetails,
  getProjectDetails,
  updateProjectDetails,
  deleteProjectDetails,
} from "../controllers/studentControllers/project.controller.js";
//Internship Controller
import {
  addInternshipDetails,
  getInternshipDetails,
  updateInternshipDetails,
  deleteInternshipDetails,
} from "../controllers/studentControllers/internship.controller.js";
//Social Controller
import {
  addSocialsDetails,
  getSocialsDetails,
  updateSocialsDetails,
  deleteSocialsDetails,
} from "../controllers/studentControllers/social.controller.js";

const studentRouter = express.Router();
studentRouter.use(express.json());

studentRouter.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

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
studentRouter.get("/social", requiresAuth(), getSocialsDetails);
studentRouter.post("/addSocial", requiresAuth(), addSocialsDetails);
studentRouter.put("/social/:socialsID", requiresAuth(), updateSocialsDetails);
studentRouter.delete(
  "/social/:socialsID",
  requiresAuth(),
  deleteSocialsDetails
);

// //APPLICATION ROUTE
// studentRouter.get("profile/applications", middleware, cont_func);

export default studentRouter;
