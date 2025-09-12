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

//STUDENT PROFILE REGISTRATION
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
      const auth0Id = "google-oauth2|103157320280067089106";
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
      console.log(user.id);
  
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
          skills: skills||[],
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

// PROFILE CONTROLLER
export const getStudentProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.oidc?.user?.sub; // Auth0 ID
    const profile = await db.studentProfile.findUnique({
      where: { userId },
      include: {
        education: true,
        projects: true,
        internships: true,
        certifications: true,
        socials: true,
        achievements: true,
        applications: true,
      },
    });
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
