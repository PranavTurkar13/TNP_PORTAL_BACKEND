import type { Request, Response } from "express";
import db from "../../client.js";

export const getEligibilityCriteria = async (req: Request, res: Response) => {
  try {
    const { jobPostId } = req.params;

    if (!jobPostId) {
      return res.status(400).json({ error: "Job Post ID is required" });
    }

    const eligibility = await db.eligibilityCriteria.findUnique({
      where: { jobPostId },
    });

    if (!eligibility) {
      return res
        .status(404)
        .json({ error: "Eligibility criteria not found for this job post" });
    }

    return res.status(200).json(eligibility);
  } catch (error) {
    console.error("Error fetching eligibility criteria:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch eligibility criteria" });
  }
};
