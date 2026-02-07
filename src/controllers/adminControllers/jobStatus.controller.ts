import type { Request, Response } from "express";
import { JobStatus } from "@prisma/client";
import db from "../../client.js";

export const updateJobStatus = async (req: Request, res: Response) => {
  try {
    const auth0Id = req.auth?.payload.sub!;
    const { jobPostId, status } = req.body;

    if (!jobPostId || !status) {
      return res.status(400).json({ error: "jobPostId and status required" });
    }

    const user = await db.user.findUnique({ where: { auth0Id } });

    if (!user || (user.role !== "ADMIN" && user.role !== "TNP_OFFICER")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const job = await db.jobPost.findUnique({ where: { id: jobPostId } });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const validTransitions: Record<JobStatus, JobStatus[]> = {
      [JobStatus.DRAFT]: [JobStatus.OPEN],
      [JobStatus.OPEN]: [JobStatus.CLOSED],
      [JobStatus.CLOSED]: [JobStatus.ARCHIVED],
      [JobStatus.ARCHIVED]: [],
    };

    if (!validTransitions[job.status].includes(status)) {
      return res.status(400).json({
        error: `Cannot change status from ${job.status} to ${status}`,
      });
    }

    const updatedJob = await db.jobPost.update({
      where: { id: jobPostId },
      data: { status },
    });

    res.json({
      message: `Job status updated to ${status}`,
      job: updatedJob,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
