import type { Request, Response } from "express";
import db from "../../client.js";

export const createJobWithEligibility = async (req: Request, res: Response) => {
  try {
    const auth0Id = req.auth?.payload.sub;
    if (!auth0Id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await db.user.findUnique({ where: { auth0Id } });

    if (!user || (user.role !== "ADMIN" && user.role !== "TNP_OFFICER")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { job, eligibility } = req.body;

    if (
      !job?.role ||
      !job?.company ||
      !job?.description ||
      !job?.ctc ||
      !job?.deadline
    ) {
      return res.status(400).json({ error: "Job details are incomplete" });
    }

    if (!eligibility) {
      return res
        .status(400)
        .json({ error: "Eligibility criteria is required" });
    }

    const result = await db.$transaction(async (tx) => {
      // Create Job Post
      const jobPost = await tx.jobPost.create({
        data: {
          postedById: user.id,
          role: job.role,
          company: job.company,
          companyInfo: job.companyInfo ?? null,
          description: job.description,
          ctc: String(job.ctc),
          deadline: new Date(job.deadline),
          status: "DRAFT",
        },
      });

      //Create Eligibility Criteria
      const eligibilityCriteria = await tx.eligibilityCriteria.create({
        data: {
          jobPostId: jobPost.id,
          minCGPA: eligibility.minCGPA ?? null,
          minTenth: eligibility.minTenth ?? null,
          minTwelfth: eligibility.minTwelfth ?? null,
          minDiploma: eligibility.minDiploma ?? null,
          maxBacklogs: eligibility.maxBacklogs ?? null,
          allowedBranches: eligibility.allowedBranches ?? [],
          passingYear: eligibility.passingYear ?? null,
        },
      });

      return { jobPost, eligibilityCriteria };
    });

    return res.status(201).json({
      message: "Job posting created successfully",
      posting: result.jobPost,
      eligibility: result.eligibilityCriteria,
    });
  } catch (error: any) {
    console.error("Transaction failed:", error);
    return res.status(500).json({
      error: "Failed to create job posting with eligibility",
    });
  }
};
