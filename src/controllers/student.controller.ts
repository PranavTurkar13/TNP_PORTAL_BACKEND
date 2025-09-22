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

//STUDENT PROFILE POST CON REGISTRATION
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
