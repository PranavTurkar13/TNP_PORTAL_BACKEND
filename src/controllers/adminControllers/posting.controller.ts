import type { Request, Response } from "express";
import db from "../../client.js";

export const addPostingDetails = async (req: Request, res: Response) => {
  try {
    const auth0Id = req.auth?.payload.sub!;
    const user = await db.user.findUnique({
      where: { auth0Id },
    });
    console.log(user?.role);
    if (user?.role !== "ADMIN" && user?.role !== "TNP_OFFICER") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const { role, company, companyInfo, description, ctc, deadline } = req.body;
    if (!role || !company || !description || !ctc || !deadline) {
      return res.status(400).json({ error: "All fields are required" });
    }

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

    const duplicate = await db.jobPost.findFirst({
      where: { role, company, description, ctc, deadline },
    });
    if (duplicate) {
      return res.status(409).json({ error: "Posting already exists" });
    }

    const posting = await db.jobPost.create({
      data: {
        postedById: userWithProfile.id,
        role,
        company,
        companyInfo,
        description,
        ctc: String(ctc),
        deadline: new Date(deadline),
      },
    });

    return res.status(201).json({
      message: "Posting added successfully",
      posting,
    });
  } catch (error: any) {
    console.error("Error adding posting:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const updatePostingDetails = async (req: Request, res: Response) => {
  try {
    const auth0Id = req.auth?.payload.sub!;
    const user = await db.user.findUnique({
      where: { auth0Id },
    });

    if (user?.role !== "ADMIN" && user?.role !== "TNP_OFFICER") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const { id, role, company, companyInfo, description, ctc, deadline } =
      req.body;
    if (!id) {
      return res.status(400).json({ error: "Posting ID is required" });
    }

    const updateData: {
      role?: string;
      company?: string;
      companyInfo?: string;
      description?: string;
      ctc?: string;
      deadline?: Date;
    } = {};

    if (role !== undefined) updateData.role = role;
    if (company !== undefined) updateData.company = company;
    if (companyInfo !== undefined) updateData.companyInfo = companyInfo;
    if (description !== undefined) updateData.description = description;
    if (ctc !== undefined) updateData.ctc = String(ctc);
    if (deadline !== undefined) updateData.deadline = new Date(deadline);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    const posting = await db.jobPost.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      message: "Posting updated successfully",
      posting,
    });
  } catch (error: any) {
    console.error("Error updating posting:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};
