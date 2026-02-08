import type { Request, Response } from "express";
import db from "../../client.js";

export const getApplicationsForJob = async (req: Request, res: Response) => {
  try {
    const auth0Id = req.auth?.payload.sub;
    const { jobId } = req.params;

    if (!auth0Id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!jobId) {
      return res.status(400).json({ error: "Job ID required" });
    }

    const user = await db.user.findUnique({ where: { auth0Id } });

    if (!user || (user.role !== "ADMIN" && user.role !== "TNP_OFFICER")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const applications = await db.application.findMany({
      where: { jobPostId: jobId },
      orderBy: { appliedAt: "desc" },
      include: {
        student: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
            education: true,
            projects: true,
            internships: true,
            certifications: true,
            achievements: true,
            socials: true,
          },
        },
      },
    });

    res.json({ applications });
  } catch (err: any) {
    console.error("Admin applications fetch failed:", err);
    res.status(500).json({ error: err.message });
  }
};
