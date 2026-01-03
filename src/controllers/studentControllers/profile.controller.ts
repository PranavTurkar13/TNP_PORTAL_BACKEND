import type { Request, Response } from "express";
import db from "../../client.js";
import { isValidPhone, isValidEmail } from "../../utils/validators.js";

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
    if (phoneNo && !isValidPhone(phoneNo)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }
    if (personalEmail && !isValidEmail(personalEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Get the logged-in user's Auth0 ID
    const auth0Id = req.auth?.payload.sub;
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
    const profile = await db.studentProfile.upsert({
      where: { userId: user.id },
      update: {
        firstName,
        middleName: middleName ?? null,
        lastName,
        personalEmail: personalEmail ?? null,
        phoneNo: phoneNo ?? null,
        dob: dob ? new Date(dob) : null,
        skills: skills || [],
      },
      create: {
        userId: user.id,
        firstName,
        middleName: middleName ?? null,
        lastName,
        personalEmail: personalEmail ?? null,
        phoneNo: phoneNo ?? null,
        dob: dob ? new Date(dob) : null,
        skills: skills || [],
      },
    });

    await db.user.update({
      where: { id: user.id },
      data: {
        onboardingStep: "EDUCATION",
      },
    });

    return res.status(201).json({
      message: "Student profile added successfully",
      nextStep: "EDUCATION",
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
    const auth0Id = req.auth?.payload.sub;
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
    const auth0Id = req.auth?.payload.sub;
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

    //Validation
    if (phoneNo && !isValidPhone(phoneNo)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }
    if (personalEmail && !isValidEmail(personalEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Update profile
    const updatedProfile = await db.studentProfile.update({
      where: { userId: user.id },
      data: {
        firstName: firstName ?? profile.firstName,
        middleName: middleName ?? profile.middleName,
        lastName: lastName ?? profile.lastName,
        personalEmail: personalEmail ?? profile.personalEmail,
        phoneNo: phoneNo !== undefined ? phoneNo : profile.phoneNo,
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

//GET FULL STUDENT PROFILE WITH EDUCATION AND EXPERIENCE AND ALL
export const getFullStudentProfile = async (req: Request, res: Response) => {
  try {
    // Get Auth0 user id from token
    const auth0Id = req.auth?.payload.sub;
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }
    const user = await db.user.findUnique({
      where: { auth0Id },
      include: {
        student: {
          include: {
            education: true,
            achievements: true,
            projects: true,
            internships: true,
            certifications: true,
            socials: true,
          },
        },
      },
    });
    if (!user || !user.student) {
      return res.status(404).json({ error: "Student profile not found" });
    }
    return res.status(200).json({ profile: user.student });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};
