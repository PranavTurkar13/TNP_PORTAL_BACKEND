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
    const auth0Id = "";
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
    // const auth0Id = req.oidc?.user?.sub;
    const auth0Id = "";
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
    // const auth0Id = req.oidc?.user?.sub;
    const auth0Id = "";
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
