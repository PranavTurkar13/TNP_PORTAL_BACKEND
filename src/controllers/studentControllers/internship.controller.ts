import type { Request, Response } from "express";
import db from "../../client.js";

// // INTERNSHIP CONTROLLERS
// Add Internship Details
export const addInternshipDetails = async (req: Request, res: Response) => {
  try {
    const { company, role, duration, description } = req.body;
    if (!company || !role || !duration || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const auth0Id = req.auth?.payload.sub;
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
    const auth0Id = req.auth?.payload.sub;
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
    const auth0Id = req.auth?.payload.sub;
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
