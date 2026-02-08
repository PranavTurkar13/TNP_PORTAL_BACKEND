import type { Request, Response } from "express";
import db from "../../client.js";
import { checkEligibility } from "../../utils/eligibility.js";

export const getAllJobsForAdmin = async (req: Request, res: Response) => {
  const jobs = await db.jobPost.findMany({
    include: {
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ jobs });
};

export const getJobByIdForAdmin = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: "Job ID required" });
    }

    const job = await db.jobPost.findUnique({
      where: { id: jobId },
      include: {
        eligibility: true,
        applications: true,
      },
    });

    if (!job || !job.eligibility) {
      return res.status(404).json({ error: "Job not found" });
    }

    const students = await db.studentProfile.findMany({
      include: {
        education: true,
        user: true,
      },
    });

    const eligibleStudents = students.filter((s) => {
      if (!s.education) return false;
      return checkEligibility(s.education, job.eligibility!).isEligible;
    });

    const appliedCount = job.applications.length;

    res.json({
      job,
      stats: {
        eligible: eligibleStudents.length,
        applied: appliedCount,
        shortlisted: job.applications.filter((a) => a.status === "SHORTLISTED")
          .length,
        selected: job.applications.filter((a) => a.status === "SELECTED")
          .length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
