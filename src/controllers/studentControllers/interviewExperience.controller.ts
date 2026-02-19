import type { Request, Response } from "express";
import db from "../../client.js";

export const createInterviewExperience = async (
  req: Request,
  res: Response,
) => {
  try {
    const { title, company, role, difficulty, content } = req.body;
    const auth0Id = req.auth?.payload.sub;

    if (!auth0Id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userWithProfile = await db.user.findUnique({
      where: { auth0Id },
      include: {
        student: true, // directly fetch student profile
      },
    });

    if (!userWithProfile) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const studentProfile = userWithProfile.student;
    if (!studentProfile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    if (!title || !company || !role || !difficulty || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const experience = await db.interviewExperience.create({
      data: {
        title,
        company,
        role,
        difficulty,
        content,
        authorId: studentProfile.id,
      },
    });

    res.status(201).json({ experience });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

//all experiences
export const getInterviewExperiences = async (req: Request, res: Response) => {
  try {
    const experiences = await db.interviewExperience.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({ experiences });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

//single experience
export const getInterviewExperienceById = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Experience ID is required" });
    }
    const experience = await db.interviewExperience.findUnique({
      where: { id },
      include: {
        author: true,
      },
    });

    if (!experience) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ experience });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

//update experience
export const updateInterviewExperience = async (
  req: Request,
  res: Response,
) => {
  try {
    const auth0Id = req.auth?.payload.sub;
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Experience ID is required" });
    }
    const { title, company, role, difficulty, content } = req.body;

    if (!auth0Id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await db.user.findUnique({
      where: { auth0Id },
      include: { student: true },
    });

    if (!user?.student) {
      return res.status(403).json({ error: "Student not found" });
    }

    const experience = await db.interviewExperience.findUnique({
      where: { id },
    });

    if (!experience) {
      return res.status(404).json({ error: "Experience not found" });
    }

    // owner check
    if (experience.authorId !== user.student.id) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const updated = await db.interviewExperience.update({
      where: { id },
      data: {
        title,
        company,
        role,
        difficulty,
        content,
      },
    });

    res.json({ experience: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

//delete experience
export const deleteInterviewExperience = async (
  req: Request,
  res: Response,
) => {
  try {
    const auth0Id = req.auth?.payload.sub;
    const { id } = req.params;

    if (!auth0Id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!id) {
      return res.status(400).json({ error: "Experience ID is required" });
    }

    const user = await db.user.findUnique({
      where: { auth0Id },
      include: { student: true },
    });

    if (!user?.student) {
      return res.status(403).json({ error: "Student not found" });
    }

    const experience = await db.interviewExperience.findUnique({
      where: { id },
    });

    if (!experience) {
      return res.status(404).json({ error: "Experience not found" });
    }

    if (experience.authorId !== user.student.id) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await db.interviewExperience.delete({
      where: { id },
    });

    res.json({ message: "Deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
