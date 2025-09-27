import type { Request, Response } from "express";
import db from "../../client.js";

// // certificate CONTROLLERS
// Add certificate Details
export const addCertificateDetails = async (req: Request, res: Response) => {
  try {
    const { title,organization,issueDate,expiryDate,credentialId,credentialUrl } = req.body;
    if (!title || !organization) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const auth0Id = req.oidc?.user?.sub;
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    const userWithProfile = await db.user.findUnique({
      where: { auth0Id },
      include: { student: true },
    });

    if (!userWithProfile) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const profile = userWithProfile.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const certificate = await db.certificate.create({
      data: {
        studentId: profile.id,
        title,
        organization,
        issueDate,
        expiryDate,
        credentialId,
        credentialUrl 
      },
    });

    return res.status(201).json({
      message: "Certificate added successfully",
      certificate,
    });
  } catch (error: any) {
    console.error("Error adding Certificate:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

//Get certificate Details
export const getCertificateDetails = async (req: Request, res: Response) => {
  try {
    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    console.log(auth0Id);
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user in database
    const user = await db.user.findUnique({ where: { auth0Id } });
    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    // Find student profile
    const profile = await db.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Find certificate details
    const certificate = await db.certificate.findMany({
      where: { studentId: profile.id },
    });

    if (!certificate) {
      return res.status(404).json({ error: "certificate details not found" });
    }

    return res.status(200).json({ certificate });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

// Update certificate Details
export const updatecertificateDetails = async (req: Request, res: Response) => {
  try {
    const { certificateID } = req.params;
    if (!certificateID) {
      return res.status(400).json({ error: "certificateID is required" });
    }
    const { title,organization,issueDate,expiryDate,credentialId,credentialUrl } = req.body;

    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user with profile
    const userWith = await db.user.findUnique({
      where: { auth0Id },
      include: { student: true },
    });

    if (!userWith) {
      return res.status(404).json({ error: "User not found in  database" });
    }

    const profile = userWith.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Checking if certificate belongs to this student
    const certificate = await db.certificate.findUnique({
      where: { id: certificateID },
    });

    if (!certificate || certificate.studentId !== profile.id) {
      return res.status(404).json({ error: "certificate not found" });
    }

    // Update certificate
    const updatedcertificate = await db.certificate.update({
      where: { id: certificateID },
      data: {
        title: title ?? certificate.title,
        organization: organization ?? certificate.organization,
        issueDate: issueDate ?? certificate.issueDate,
        expiryDate: expiryDate ?? certificate.expiryDate,
        credentialId: credentialId ?? certificate.credentialId,
        credentialUrl: credentialUrl ?? certificate.credentialUrl,
      },
    });

    return res.status(200).json({
      message: "certificate updated successfully",
      certificate: updatedcertificate,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

// Delete certificate Details
export const deletecertificateDetails = async (req: Request, res: Response) => {
  try {
    const { certificateID } = req.params;
    if (!certificateID) {
      return res.status(400).json({ error: "certificateID is required" });
    }

    // Get Auth0 user id from token
    const auth0Id = req.oidc?.user?.sub;
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user with profile
    const userWithProfile = await db.user.findUnique({
      where: { auth0Id },
      include: { student: true },
    });

    if (!userWithProfile) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const profile = userWithProfile.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }
    // Check if certificate belongs to this student
    const certificate = await db.certificate.findUnique({
      where: { id: certificateID },
    });

    if (!certificate || certificate.studentId !== profile.id) {
      return res.status(404).json({ error: "certificate not found" });
    }

    // Delete certificate
    await db.certificate.delete({ where: { id: certificateID } });

    return res.status(200).json({ message: "certificate deleted successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};
