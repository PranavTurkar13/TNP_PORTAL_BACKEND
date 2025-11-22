import type { Request, Response } from "express";
import db from "../../client.js";

// // CERTIFICATE CONTROLLERS
// Add Certificate Details
export const addCertificateDetails = async (req: Request, res: Response) => {
  try {
    const {
      title,
      organization,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
    } = req.body;
    if (!title || !organization || !issueDate || !credentialUrl) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const auth0Id = req.auth?.payload.sub;
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

    const duplicate = await db.certification.findFirst({
      where: { studentId: profile.id, title, organization, credentialUrl },
    });
    if (duplicate) {
      return res.status(409).json({ error: "Certificate already exists" });
    }

    const certificate = await db.certification.create({
      data: {
        studentId: profile.id,
        title,
        organization,
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialId: credentialId ? credentialId : null,
        credentialUrl,
      },
    });

    return res.status(201).json({
      message: "Certificate added successfully",
      certificate,
    });
  } catch (error: any) {
    console.error("Error adding certificate:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

//Get Certificate Details
export const getCertificateDetails = async (req: Request, res: Response) => {
  try {
    // Get Auth0 user id from token
    const auth0Id = req.auth?.payload.sub;
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
    const certificate = await db.certification.findMany({
      where: { studentId: profile.id },
    });

    if (!certificate) {
      return res.status(404).json({ error: "Certificate details not found" });
    }

    return res.status(200).json({ certificate });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

// Update Certificate Details
export const updateCertficateDetails = async (req: Request, res: Response) => {
  try {
    const { certificateID } = req.params;
    if (!certificateID) {
      return res.status(400).json({ error: "certificateID is required" });
    }
    const {
      title,
      organization,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
    } = req.body;

    // Get Auth0 user id from token
    const auth0Id = req.auth?.payload.sub;
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    const userWithProfileAndCertificates = await db.user.findUnique({
      where: { auth0Id },
      include: {
        student: {
          include: {
            certifications: true,
          },
        },
      },
    });

    if (!userWithProfileAndCertificates) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const profile = userWithProfileAndCertificates.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Checking if certificate belongs to this student
    const certificate = await db.certification.findUnique({
      where: { id: certificateID },
    });

    if (!certificate || certificate.studentId !== profile.id) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    // Update internship
    const updatedCertificate = await db.certification.update({
      where: { id: certificateID },
      data: {
        title: title ?? certificate.title,
        organization: organization ?? certificate.organization,
        issueDate: issueDate ? new Date(issueDate) : certificate.issueDate,
        expiryDate: expiryDate ? new Date(expiryDate) : certificate.expiryDate,
        credentialId: credentialId ?? certificate.credentialId,
        credentialUrl: credentialUrl ?? certificate.credentialUrl,
      },
    });

    return res.status(200).json({
      message: "Certificate updated successfully",
      certificate: updatedCertificate,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

// Delete Certificate Details
export const deleteCertificateDetails = async (req: Request, res: Response) => {
  try {
    const { certificateID } = req.params;
    if (!certificateID) {
      return res.status(400).json({ error: "certificateID is required" });
    }

    // Get Auth0 user id from token
    const auth0Id = req.auth?.payload.sub;
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user with profile
    const userWithProfileAndCertificates = await db.user.findUnique({
      where: { auth0Id },
      include: {
        student: {
          include: {
            certifications: true,
          },
        },
      },
    });

    if (!userWithProfileAndCertificates) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const profile = userWithProfileAndCertificates.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Checking if certificate belongs to this student
    const certificate = await db.certification.findUnique({
      where: { id: certificateID },
    });

    if (!certificate || certificate.studentId !== profile.id) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    // Delete certificate
    await db.certification.delete({ where: { id: certificateID } });

    return res
      .status(200)
      .json({ message: "Certificate deleted successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};
