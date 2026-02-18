import type { Request, Response } from "express";
import db from "../../client.js";

export const getPublicProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const profile = await db.studentProfile.findFirst({
            where: { userId: userId },
            include: {
                education: true,
                achievements: true,
                projects: true,
                internships: true,
                certifications: true,
                socials: true,
            },
        });
        if (!profile) {
            return res.status(404).json({ error: "Student profile not found" });
        }
        return res.status(200).json({ profile });
    } catch (error) {
        console.error("Error getting public profile:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};