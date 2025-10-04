import type { Request, Response } from "express";
import db from "../../client.js";

// // SOCIALS CONTROLLERS
// Add Socials Details
export const addSocialsDetails = async (req: Request, res: Response) => {
  try {
    const { platform, url } = req.body;

    if (!platform && !url) {
      return res.status(400).json({ error: "Social Link is required" });
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
