import type { Request, Response } from "express";
import db from "../../client.js";

export const searchStudents = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        if (!query || typeof query !== "string") {
            return res.status(200).json({ students: [] });
        }

        const students = await db.studentProfile.findMany({
            where: {
                OR: [
                    { firstName: { contains: query, mode: "insensitive" } },
                    { lastName: { contains: query, mode: "insensitive" } },
                    { education: { branch: { contains: query, mode: "insensitive" } } },
                ],
            },
            select: {
                id: true,
                userId: true,
                firstName: true,
                lastName: true,
                education: {
                    select: {
                        branch: true,
                        passingYear: true,
                    }
                }
            },
            take: 10,
        });

        return res.status(200).json({ students });
    } catch (error) {
        console.error("Error searching students:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getPublicProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const profile = await db.studentProfile.findFirst({
            where: { userId: userId },
            select: {
                id: true,
                userId: true,
                firstName: true,
                middleName: true,
                lastName: true,
                skills: true,
                education: true,
                achievements: true,
                projects: true,
                internships: true,
                certifications: true,
                socials: true,
                createdAt: true,
                updatedAt: true,
                // Excluded sensitive fields: personalEmail, phoneNo, dob
            }
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