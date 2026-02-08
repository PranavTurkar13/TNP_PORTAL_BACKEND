import type { Request, Response, NextFunction } from "express";
import db from "../client.js";

export const requireRole = (roles: ("ADMIN" | "STUDENT" | "TNP_OFFICER")[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth0Id = req.auth?.payload.sub as string;

      if (!auth0Id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await db.user.findUnique({
        where: { auth0Id },
        select: { role: true },
      });

      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      next();
    } catch (err) {
      return res.status(500).json({ error: "Role check failed" });
    }
  };
};
