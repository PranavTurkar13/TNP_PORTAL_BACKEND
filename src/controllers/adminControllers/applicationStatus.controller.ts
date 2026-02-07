// adminControllers/applicationStatus.controller.ts
import type { Request, Response } from "express";
import db from "../../client.js";

export const bulkUpdateApplicationStatus = async (
  req: Request,
  res: Response,
) => {
  try {
    const auth0Id = req.auth?.payload.sub;
    const { applicationIds, status } = req.body;

    if (!auth0Id) return res.status(401).json({ error: "Unauthorized" });
    if (!Array.isArray(applicationIds) || !status) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const user = await db.user.findUnique({ where: { auth0Id } });

    if (!user || (user.role !== "ADMIN" && user.role !== "TNP_OFFICER")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const result = await db.application.updateMany({
      where: {
        id: { in: applicationIds },
      },
      data: {
        status,
      },
    });

    res.json({
      message: "Application statuses updated",
      updatedCount: result.count,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
