import type { Request, Response } from "express";
import db from "../../client.js";

export const applyForJob = async (req: Request, res: Response) => {
    try {
        const auth0Id = req.auth?.payload.sub!;
        const user = await db.user.findUnique({
            where: { auth0Id },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const student = await db.studentProfile.findUnique({
            where: { userId: user.id },
        });

        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        if (user.role !== "STUDENT") {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const { postingId } = req.body;
        const application = await db.application.create({
            data: {
                studentId: student.id,
                jobPostId: postingId,
            },
        });
        return res.status(200).json({ message: "Job applied successfully" });
    } catch (error) {
        console.error("Error applying for job:", error);
        return res.status(500).json({ error: "Failed to apply for job" });
    }
};

export const getApplications = async (req: Request, res: Response) => {
    try {
        const auth0Id = req.auth?.payload.sub!;
        const user = await db.user.findUnique({
            where: { auth0Id },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const student = await db.studentProfile.findUnique({
            where: { userId: user.id },
        });

        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        if (user.role !== "STUDENT") {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const applications = await db.application.findMany({
            where: { studentId: student.id },
        });
        return res.status(200).json(applications);
    } catch (error) {
        console.error("Error getting applications:", error);
        return res.status(500).json({ error: "Failed to get applications" });
    }
};
