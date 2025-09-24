import type { Request, Response } from "express";
import db from "../client.js";

//USER REGISTERATION
export const userRegister = async (req: Request, res: Response) => {
  try {
    const { email, auth0Id } = req.body;

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(200)
        .json({ message: "User already exists", user: existingUser });
    }

    const newUser = await db.user.create({
      data: { email, auth0Id },
    });

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// // PROFILE CONTROLLERS
//STUDENT PROFILE POST ON REGISTRATION
export const registerStudentProfile = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      personalEmail,
      phoneNo,
      dob,
      skills,
    } = req.body;

    if (!firstName || !lastName) {
      return res
        .status(400)
        .json({ error: "firstName and lastName are required" });
    }

    // Get the logged-in user's Auth0 ID
    const auth0Id = req.oidc?.user?.sub;
    console.log(auth0Id);
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find the corresponding User in the database
    const user = await db.user.findUnique({ where: { auth0Id } });
    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    // Check if StudentProfile already exists
    const existingProfile = await db.studentProfile.findUnique({
      where: { userId: user.id },
    });
    if (existingProfile) {
      return res.status(409).json({ error: "Student profile already exists" });
    }

    // Create StudentProfile linked to this user
    const profile = await db.studentProfile.create({
      data: {
        userId: user.id,
        firstName,
        middleName: middleName ?? null,
        lastName,
        personalEmail: personalEmail ?? null,
        phoneNo: phoneNo ? Number(phoneNo) : null,
        dob: dob ? new Date(dob) : null,
        skills: skills || [],
      },
    });

    return res.status(201).json({
      message: "Student profile added successfully",
      profile,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// PROFILE GET CONTROLLER
export const getStudentProfile = async (req: Request, res: Response) => {
  try {
    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    console.log(auth0Id);
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user in database
    const user = await db.user.findUnique({ where: { auth0Id } });
    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    // Find student profile
    const profile = await db.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    return res.status(200).json({ profile });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

// PROFILE UPDATE CONTROLLER
export const updateStudentProfile = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      personalEmail,
      phoneNo,
      dob,
      skills,
    } = req.body;

    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    console.log(auth0Id);
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user in database
    const user = await db.user.findUnique({ where: { auth0Id } });
    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    // Find student profile
    const profile = await db.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Update profile
    const updatedProfile = await db.studentProfile.update({
      where: { userId: user.id },
      data: {
        firstName: firstName ?? profile.firstName,
        middleName: middleName ?? profile.middleName,
        lastName: lastName ?? profile.lastName,
        personalEmail: personalEmail ?? profile.personalEmail,
        phoneNo: phoneNo !== undefined ? Number(phoneNo) : profile.phoneNo,
        dob: dob ? new Date(dob) : profile.dob,
        skills: skills ?? profile.skills,
      },
    });

    return res.status(200).json({
      message: "Student profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

// // EDUCATION CONTROLLERS
// ADD EDUCATION DETAILS CONTROLLER
export const addEducationDetails = async (req: Request, res: Response) => {
  try {
    const {
      branch,
      enrollmentYear,
      cgpa,
      tenthPercent,
      tenthYear,
      twelfthPercent,
      twelfthYear,
      diplomaPercent,
      diplomaYear,
      backlogs,
    } = req.body;

    // Validate required fields
    if (
      !branch ||
      !enrollmentYear ||
      cgpa === undefined ||
      backlogs === undefined
    ) {
      return res.status(400).json({
        error: "branch, enrollmentYear, cgpa, and backlogs are required fields",
      });
    }

    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    // const auth0Id = "";
    console.log(auth0Id);
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user in database
    const user = await db.user.findUnique({ where: { auth0Id } });
    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    // Find student profile
    const profile = await db.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Check if education details already exist
    const existingEducation = await db.education.findUnique({
      where: { studentId: profile.id },
    });

    if (existingEducation) {
      return res.status(409).json({ error: "Education details already exist" });
    }

    // Create education details
    const education = await db.education.create({
      data: {
        studentId: profile.id,
        branch,
        enrollmentYear: Number(enrollmentYear),
        passingYear: enrollmentYear + (diplomaYear ? 3 : 4), // Default passing year to enrollmentYear + 4
        cgpa: Number(cgpa),
        tenthPercent: tenthPercent ? Number(tenthPercent) : null,
        tenthYear: tenthYear ? Number(tenthYear) : null,
        twelfthPercent: twelfthPercent ? Number(twelfthPercent) : null,
        twelfthYear: twelfthYear ? Number(twelfthYear) : null,
        diplomaPercent: diplomaPercent ? Number(diplomaPercent) : null,
        diplomaYear: diplomaYear ? Number(diplomaYear) : null,
        backlogs: Number(backlogs),
      },
    });

    return res.status(201).json({
      message: "Education details added successfully",
      education,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

//GET EDUCATION DETAILS CONTROLLER
export const getEducationDetails = async (req: Request, res: Response) => {
  try {
    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    console.log(auth0Id);
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user in database
    const user = await db.user.findUnique({ where: { auth0Id } });
    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    // Find student profile
    const profile = await db.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Find education details
    const education = await db.education.findUnique({
      where: { studentId: profile.id },
    });

    if (!education) {
      return res.status(404).json({ error: "Education details not found" });
    }

    return res.status(200).json({ education });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

//UPDATE EDUCATION DETAILS CONTROLLER
export const updateEducationDetails = async (req: Request, res: Response) => {
  try {
    const {
      branch,
      enrollmentYear,
      cgpa,
      tenthPercent,
      tenthYear,
      twelfthPercent,
      twelfthYear,
      diplomaPercent,
      diplomaYear,
      backlogs,
    } = req.body;

    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    console.log(auth0Id);
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user in database
    // Find user, student profile, and education details in a single query using Prisma's relations
    const userWithProfileAndEducation = await db.user.findUnique({
      where: { auth0Id },
      include: {
        student: {
          include: {
            education: true,
          },
        },
      },
    });

    if (!userWithProfileAndEducation) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const profile = userWithProfileAndEducation.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const education = profile.education;
    if (!education) {
      return res.status(404).json({ error: "Education details not found" });
    }

    // Update education details
    const updatedEducation = await db.education.update({
      where: { studentId: profile.id },
      data: {
        branch: branch ?? education.branch,
        enrollmentYear: enrollmentYear
          ? Number(enrollmentYear)
          : education.enrollmentYear,
        cgpa: cgpa !== undefined ? Number(cgpa) : education.cgpa,
        tenthPercent:
          tenthPercent !== undefined
            ? Number(tenthPercent)
            : education.tenthPercent,
        tenthYear:
          tenthYear !== undefined ? Number(tenthYear) : education.tenthYear,
        twelfthPercent:
          twelfthPercent !== undefined
            ? Number(twelfthPercent)
            : education.twelfthPercent,
        twelfthYear:
          twelfthYear !== undefined
            ? Number(twelfthYear)
            : education.twelfthYear,
        diplomaPercent:
          diplomaPercent !== undefined
            ? Number(diplomaPercent)
            : education.diplomaPercent,
        diplomaYear:
          diplomaYear !== undefined
            ? Number(diplomaYear)
            : education.diplomaYear,
        backlogs:
          backlogs !== undefined ? Number(backlogs) : education.backlogs,
      },
    });

    return res.status(200).json({
      message: "Education details updated successfully",
      education: updatedEducation,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

//DELETE EDUCATION DETAILS CONTROLLER
export const deleteEducationDetails = async (req: Request, res: Response) => {
  try {
    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    console.log(auth0Id);
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user in database
    const user = await db.user.findUnique({ where: { auth0Id } });
    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    // Find student profile
    const profile = await db.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Find education details
    const education = await db.education.findUnique({
      where: { studentId: profile.id },
    });

    if (!education) {
      return res.status(404).json({ error: "Education details not found" });
    }

    // Delete education details
    await db.education.delete({ where: { studentId: profile.id } });

    return res
      .status(200)
      .json({ message: "Education details deleted successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

// // ACHIEVEMENT CONTROLLERS
//GET ACHIEVEMENT DETAILS CONTROLLER
export const getAchievementDetails = async (req: Request, res: Response) => {
  try {
    const auth0Id = req.oidc?.user?.sub;
    console.log(auth0Id);
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user with student profile + achievements
    const userWithProfileAndAchievements = await db.user.findUnique({
      where: { auth0Id },
      include: {
        student: {
          include: {
            achievements: true,
          },
        },
      },
    });

    if (!userWithProfileAndAchievements) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const profile = userWithProfileAndAchievements.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const achievements = profile.achievements;
    if (!achievements || achievements.length === 0) {
      return res
        .status(404)
        .json({ error: "No achievements found for this student" });
    }

    return res.status(200).json({
      message: "Achievements fetched successfully",
      achievements,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

//POST ACHIEVEMENT DETAILS CONTROLLER
export const addAchievementDetails = async (req: Request, res: Response) => {
  try {
    const { title, description, date, type } = req.body;

    // Validate required fields
    if (!title) {
      return res
        .status(400)
        .json({ error: "title and date are required fields" });
    }

    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    console.log(auth0Id);
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user in database
    const userWithProfile = await db.user.findUnique({
      where: { auth0Id },
      include: {
        student: true, // directly fetch student profile
      },
    });

    if (!userWithProfile) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const profile = userWithProfile.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Create achievement details
    const achievement = await db.achievement.create({
      data: {
        studentId: profile.id,
        title,
        description: description || null,
        date: date ? new Date(date) : null,
        type: type || null,
      },
    });

    return res.status(201).json({
      message: "Achievement added successfully",
      achievement,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

//UPDATE ACHIEVEMENT DETAILS CONTROLLER
export const updateAchievementDetails = async (req: Request, res: Response) => {
  try {
    const { achievementID } = req.params;
    if (!achievementID) {
      return res.status(400).json({ error: "achievementID is required" });
    }
    const { title, description, date, type } = req.body;

    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user with profile
    const userWithProfile = await db.user.findUnique({
      where: { auth0Id },
      include: { student: true },
    });

    if (!userWithProfile) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const profile = userWithProfile.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Check if achievement belongs to this student
    const achievement = await db.achievement.findUnique({
      where: { id: achievementID },
    });

    if (!achievement || achievement.studentId !== profile.id) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    // Update achievement
    const updatedAchievement = await db.achievement.update({
      where: { id: achievementID },
      data: {
        title: title ?? achievement.title,
        description: description ?? achievement.description,
        date: date ? new Date(date) : achievement.date,
        type: type ?? achievement.type,
      },
    });

    return res.status(200).json({
      message: "Achievement updated successfully",
      achievement: updatedAchievement,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

// DELETE ACHIEVEMENT DETAILS CONTROLLER
export const deleteAchievementDetails = async (req: Request, res: Response) => {
  try {
    const { achievementID } = req.params;
    if (!achievementID) {
      return res.status(400).json({ error: "achievementID is required" });
    }

    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user with profile
    const userWithProfile = await db.user.findUnique({
      where: { auth0Id },
      include: { student: true },
    });

    if (!userWithProfile) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const profile = userWithProfile.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }
    // Check if achievement belongs to this student
    const achievement = await db.achievement.findUnique({
      where: { id: achievementID },
    });

    if (!achievement || achievement.studentId !== profile.id) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    // Delete achievement
    await db.achievement.delete({ where: { id: achievementID } });

    return res
      .status(200)
      .json({ message: "Achievement deleted successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

// //PROJECT CONTROLLERS
// Add Project Details
export const addProjectDetails = async (req: Request, res: Response) => {
  try {
    const { title, description, link, techStack } = req.body;

    if (!title || !description || !link || !techStack) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const auth0Id = req.oidc?.user?.sub;
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    const userWithProfile = await db.user.findUnique({
      where: { auth0Id },
      include: { student: true },
    });

    if (!userWithProfile) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const profile = userWithProfile.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const project = await db.project.create({
      data: {
        studentId: profile.id,
        title,
        description,
        techStack, // array of strings
        link: link || null,
      },
    });

    return res.status(201).json({
      message: "Project added successfully",
      project,
    });
  } catch (error: any) {
    console.error("Error adding project:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

//Get Project Details
export const getProjectDetails = async (req: Request, res: Response) => {
  try {
    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    console.log(auth0Id);
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user in database
    const user = await db.user.findUnique({ where: { auth0Id } });
    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    // Find student profile
    const profile = await db.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Find project details
    const project = await db.project.findMany({
      where: { studentId: profile.id },
    });

    if (!project) {
      return res.status(404).json({ error: "Project details not found" });
    }

    return res.status(200).json({ project });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

// Update Project Details
export const updateProjectDetails = async (req: Request, res: Response) => {
  try {
    const { projectID } = req.params;
    if (!projectID) {
      return res.status(400).json({ error: "projectID is required" });
    }
    const { title, description, link, techStack } = req.body;

    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user with profile
    const userWithProfile = await db.user.findUnique({
      where: { auth0Id },
      include: { student: true },
    });

    if (!userWithProfile) {
      return res.status(404).json({ error: "User not found in  database" });
    }

    const profile = userWithProfile.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Checking if project belongs to this student
    const project = await db.project.findUnique({
      where: { id: projectID },
    });

    if (!project || project.studentId !== profile.id) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Update project
    const updatedProject = await db.project.update({
      where: { id: projectID },
      data: {
        title: title ?? project.title,
        description: description ?? project.description,
        link: link ?? project.link,
        techStack: techStack ?? project.techStack,
      },
    });

    return res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

// Delete Project Details
export const deleteProjectDetails = async (req: Request, res: Response) => {
  try {
    const { projectID } = req.params;
    if (!projectID) {
      return res.status(400).json({ error: "projectID is required" });
    }

    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user with profile
    const userWithProfile = await db.user.findUnique({
      where: { auth0Id },
      include: { student: true },
    });

    if (!userWithProfile) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const profile = userWithProfile.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }
    // Check if project belongs to this student
    const project = await db.project.findUnique({
      where: { id: projectID },
    });

    if (!project || project.studentId !== profile.id) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Delete project
    await db.project.delete({ where: { id: projectID } });

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

// // INTERNSHIP CONTROLLERS
// Add Internship Details
export const addInternshipDetails = async (req: Request, res: Response) => {
  try {
    const { company, role, duration, description } = req.body;
    if (!company || !role || !duration || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const auth0Id = req.oidc?.user?.sub;
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    const userWithProfile = await db.user.findUnique({
      where: { auth0Id },
      include: { student: true },
    });

    if (!userWithProfile) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const profile = userWithProfile.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const internship = await db.internship.create({
      data: {
        studentId: profile.id,
        company,
        role,
        duration, // array of strings
        description,
      },
    });

    return res.status(201).json({
      message: "Internship added successfully",
      internship,
    });
  } catch (error: any) {
    console.error("Error adding internship:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

//Get Internship Details
export const getInternshipDetails = async (req: Request, res: Response) => {
  try {
    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    console.log(auth0Id);
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user in database
    const user = await db.user.findUnique({ where: { auth0Id } });
    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    // Find student profile
    const profile = await db.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Find internship details
    const internship = await db.internship.findMany({
      where: { studentId: profile.id },
    });

    if (!internship) {
      return res.status(404).json({ error: "Internship details not found" });
    }

    return res.status(200).json({ internship });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

// Update Internship Details
export const updateInternshipDetails = async (req: Request, res: Response) => {
  try {
    const { internshipID } = req.params;
    if (!internshipID) {
      return res.status(400).json({ error: "internshipID is required" });
    }
    const { company, role, duration, description } = req.body;

    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user with profile
    const userWith = await db.user.findUnique({
      where: { auth0Id },
      include: { student: true },
    });

    if (!userWith) {
      return res.status(404).json({ error: "User not found in  database" });
    }

    const profile = userWith.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Checking if internship belongs to this student
    const internship = await db.internship.findUnique({
      where: { id: internshipID },
    });

    if (!internship || internship.studentId !== profile.id) {
      return res.status(404).json({ error: "Internship not found" });
    }

    // Update internship
    const updatedInternship = await db.internship.update({
      where: { id: internshipID },
      data: {
        company: company ?? internship.company,
        role: role ?? internship.role,
        duration: duration ?? internship.duration,
        description: description ?? internship.description,
      },
    });

    return res.status(200).json({
      message: "Internship updated successfully",
      internship: updatedInternship,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

// Delete Internship Details
export const deleteInternshipDetails = async (req: Request, res: Response) => {
  try {
    const { internshipID } = req.params;
    if (!internshipID) {
      return res.status(400).json({ error: "internshipID is required" });
    }

    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user with profile
    const userWithProfile = await db.user.findUnique({
      where: { auth0Id },
      include: { student: true },
    });

    if (!userWithProfile) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const profile = userWithProfile.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }
    // Check if internship belongs to this student
    const internship = await db.internship.findUnique({
      where: { id: internshipID },
    });

    if (!internship || internship.studentId !== profile.id) {
      return res.status(404).json({ error: "Internship not found" });
    }

    // Delete internship
    await db.internship.delete({ where: { id: internshipID } });

    return res.status(200).json({ message: "Internship deleted successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

// // SOCIALS CONTROLLERS
// Add Socials Details
export const addSocialsDetails = async (req: Request, res: Response) => {
  try {
    const { platform, url } = req.body;

    if (!platform && !url) {
      return res.status(400).json({ error: "Social Link is required" });
    }

    const auth0Id = req.oidc?.user?.sub;
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    const userWithProfile = await db.user.findUnique({
      where: { auth0Id },
      include: { student: true },
    });

    if (!userWithProfile) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const profile = userWithProfile.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Check if socials already exist for this student
    const existingSocials = await db.socialMediaProfile.findFirst({
      where: { studentId: profile.id, platform },
    });
    if (existingSocials) {
      return res.status(409).json({ error: "Socials already exist" });
    }

    const socials = await db.socialMediaProfile.create({
      data: {
        studentId: profile.id,
        platform,
        url,
      },
    });

    return res.status(201).json({
      message: "Socials added successfully",
      socials,
    });
  } catch (error: any) {
    console.error("Error adding socials:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

//Get Socials Details
export const getSocialsDetails = async (req: Request, res: Response) => {
  try {
    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    console.log(auth0Id);
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user in database
    const user = await db.user.findUnique({ where: { auth0Id } });
    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    // Find student profile
    const profile = await db.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Find socials details
    const socials = await db.socialMediaProfile.findMany({
      where: { studentId: profile.id },
    });

    if (!socials) {
      return res.status(404).json({ error: "Socials details not found" });
    }

    return res.status(200).json({ socials });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

// Update Socials Details
export const updateSocialsDetails = async (req: Request, res: Response) => {
  try {
    const { socialsID } = req.params;
    if (!socialsID) {
      return res.status(400).json({ error: "socialsID is required" });
    }
    const { platform, url } = req.body;

    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user with profile
    const userWithProfile = await db.user.findUnique({
      where: { auth0Id },
      include: { student: true },
    });

    if (!userWithProfile) {
      return res.status(404).json({ error: "User not found in  database" });
    }

    const profile = userWithProfile.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Checking if socials belongs to this student
    const socials = await db.socialMediaProfile.findUnique({
      where: { id: socialsID },
    });

    if (!socials || socials.studentId !== profile.id) {
      return res.status(404).json({ error: "Socials not found" });
    }

    // Update socials
    const updatedSocials = await db.socialMediaProfile.update({
      where: { id: socialsID },
      data: {
        platform: platform ?? socials.platform,
        url: url ?? socials.url,
      },
    });

    return res.status(200).json({
      message: "Socials updated successfully",
      socials: updatedSocials,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

// Delete Socials Details
export const deleteSocialsDetails = async (req: Request, res: Response) => {
  try {
    const { socialsID } = req.params;
    if (!socialsID) {
      return res.status(400).json({ error: "socialsID is required" });
    }
    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user with profile
    const userWithProfile = await db.user.findUnique({
      where: { auth0Id },
      include: { student: true },
    });

    if (!userWithProfile) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const profile = userWithProfile.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }
    // Check if socials belongs to this student
    const socials = await db.socialMediaProfile.findUnique({
      where: { id: socialsID },
    });

    if (!socials || socials.studentId !== profile.id) {
      return res.status(404).json({ error: "Socials not found" });
    }
    // Delete socials
    await db.socialMediaProfile.delete({ where: { id: socialsID } });

    return res.status(200).json({ message: "Socials deleted successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};
