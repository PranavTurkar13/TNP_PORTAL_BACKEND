import type { Request, Response } from "express";
import db from "../../client.js";

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
