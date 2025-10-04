import type { Request, Response } from "express";
import db from "../../client.js";

// //PROJECT CONTROLLERS
// Add Project Details
export const addProjectDetails = async (req: Request, res: Response) => {
  try {
    const { title, description, link, techStack } = req.body;

    if (!title || !description || !link || !techStack) {
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
