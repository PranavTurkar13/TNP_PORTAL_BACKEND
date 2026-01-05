import type { Request, Response } from "express";
import db from "../../client.js";

export const addEligibilityCriteria = async (req: Request, res: Response) => {
    try {
        const auth0Id = req.auth?.payload.sub!;
        const user = await db.user.findUnique({
            where: { auth0Id },
        });

        if (user?.role !== "ADMIN" || "TNP_OFFICER") {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const { jobPostId, minCGPA, allowedBranches, maxBacklogs, minTenth, minTwelfth, minDiploma, passingYear } = req.body;

        const eligibility = await db.eligibilityCriteria.create({
            data: {
                jobPostId,
                minCGPA,
                allowedBranches,
                maxBacklogs,
                minTenth,
                minTwelfth,
                minDiploma,
                passingYear
            }
        });

        return res.status(201).json(eligibility);
    } catch (error) {
        console.error("Error adding eligibility criteria:", error);
        return res.status(500).json({ error: "Failed to add eligibility criteria" });
    }
};

export const updateEligibilityCriteria = async (req: Request, res: Response) => {
    try {
        const auth0Id = req.auth?.payload.sub!;
        const user = await db.user.findUnique({
            where: { auth0Id },
        });

        if (user?.role !== "ADMIN" || "TNP_OFFICER") {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const { jobPostId, minCGPA, allowedBranches, maxBacklogs, minTenth, minTwelfth, minDiploma, passingYear } = req.body;
        const eligibility = await db.eligibilityCriteria.update({
            where: { jobPostId },
            data: {
                minCGPA,
                allowedBranches,
                maxBacklogs,
                minTenth,
                minTwelfth,
                minDiploma,
                passingYear
            }
        });
        return res.status(200).json(eligibility);
    } catch (error) {
        console.error("Error updating eligibility criteria:", error);
        return res.status(500).json({ error: "Failed to update eligibility criteria" });
    }
};

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
            return res.status(404).json({ error: "Eligibility criteria not found for this job post" });
        }

        return res.status(200).json(eligibility);
    } catch (error) {
        console.error("Error fetching eligibility criteria:", error);
        return res.status(500).json({ error: "Failed to fetch eligibility criteria" });
    }
};