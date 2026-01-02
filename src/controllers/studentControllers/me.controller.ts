import type { Request, Response } from "express";
import db from "../../client.js";

export const getMe = async (req: Request, res: Response) => {
  try {
    const auth0Id = req.auth?.payload.sub;
    console.log(auth0Id);

    if (!auth0Id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await db.user.findUnique({
      where: { auth0Id },
      select: {
        id: true,
        email: true,
        role: true,
        onboardingStep: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
