import type { Request, Response } from "express";
import db from "../client.js";

export const userRegister = async (req: Request, res: Response) => {
  try {
    const user = req.body;
    const response = await db.user.create({
      data: user,
    });
    res.redirect("https://1099ab7f4bc2.ngrok-free.app/profile");
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const registerStudent = async (req: Request, res: Response) => {
  try {
    const student = req.body;
    const response = await db.user.create({
      data: {
        email: student.email,
        auth0Id: student.auth0Id ?? null,
        role: student.role || "STUDENT",
        student: {
          create: {
            firstName: student.firstName,
            middleName: student.middleName,
            lastName: student.lastName,
            personalEmail: student.personalEmail,
            phoneNo: student.phoneNo ? Number(student.phoneNo) : null,
            dob: student.dob ? new Date(student.dob) : null,
            skills: student.skills || [],
          },
        },
      },
    });
    res.status(201).json({ message: "Student registered", student: response });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
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
