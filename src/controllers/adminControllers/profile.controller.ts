import type { Request, Response } from "express";
import db from "../../client.js";

export const getAdminProfile = async (req: Request, res: Response) => {
  try {
    const auth0Id = req.auth?.payload.sub as string;

    if (!auth0Id) return res.status(401).json({ error: "Unauthorized" });

    const user = await db.user.findUnique({
      where: { auth0Id },
      include: { adminProfile: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "TNP_OFFICER")) {
      return res.status(403).json({ error: "Not allowed" });
    }

    res.json({ profile: user.adminProfile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const upsertAdminProfile = async (req: Request, res: Response) => {
  try {
    const auth0Id = req.auth?.payload.sub as string;

    if (!auth0Id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { fullName, phoneNo, organization, designation } = req.body;

    const user = await db.user.findUnique({
      where: { auth0Id },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "TNP_OFFICER")) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const profile = await db.adminProfile.upsert({
      where: { userId: user.id },
      update: {
        fullName,
        phoneNo,
        organization,
        designation,
      },
      create: {
        userId: user.id,
        fullName,
        phoneNo,
        organization,
        designation,
      },
    });

    await db.user.update({
      where: { id: user.id },
      data: {
        onboardingStep: "COMPLETED",
      },
    });

    res.json({ profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
