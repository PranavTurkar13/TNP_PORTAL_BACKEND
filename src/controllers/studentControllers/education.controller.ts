import type { Request, Response } from "express";
import db from "../../client.js";

// // EDUCATION CONTROLLERS
// ADD EDUCATION DETAILS CONTROLLER
export const addEducationDetails = async (req: Request, res: Response) => {
  try {
    const {
      branch,
      enrollmentYear,
      cgpa,
      tenthPercent,
      tenthYear,
      twelfthPercent,
      twelfthYear,
      diplomaPercent,
      diplomaYear,
      backlogs,
    } = req.body;

    // Validate required fields
    if (
      !branch ||
      !enrollmentYear ||
      cgpa === undefined ||
      backlogs === undefined
    ) {
      return res.status(400).json({
        error: "branch, enrollmentYear, cgpa, and backlogs are required fields",
      });
    }

    // Get Auth0 user id from token
    const auth0Id = req.auth?.payload.sub;
    // const auth0Id = "";
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

    // Check if education details already exist
    const existingEducation = await db.education.findUnique({
      where: { studentId: profile.id },
    });

    if (existingEducation) {
      return res.status(409).json({ error: "Education details already exist" });
    }

    // Create education details
    const education = await db.education.create({
      data: {
        studentId: profile.id,
        branch,
        enrollmentYear: Number(enrollmentYear),
        passingYear: enrollmentYear + (diplomaYear ? 3 : 4), // Default passing year to enrollmentYear + 4
        cgpa: Number(cgpa),
        tenthPercent: tenthPercent ? Number(tenthPercent) : null,
        tenthYear: tenthYear ? Number(tenthYear) : null,
        twelfthPercent: twelfthPercent ? Number(twelfthPercent) : null,
        twelfthYear: twelfthYear ? Number(twelfthYear) : null,
        diplomaPercent: diplomaPercent ? Number(diplomaPercent) : null,
        diplomaYear: diplomaYear ? Number(diplomaYear) : null,
        backlogs: Number(backlogs),
      },
    });

    return res.status(201).json({
      message: "Education details added successfully",
      education,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

//GET EDUCATION DETAILS CONTROLLER
export const getEducationDetails = async (req: Request, res: Response) => {
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

    // Find education details
    const education = await db.education.findUnique({
      where: { studentId: profile.id },
    });

    if (!education) {
      return res.status(404).json({ error: "Education details not found" });
    }

    return res.status(200).json({ education });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

//UPDATE EDUCATION DETAILS CONTROLLER
export const updateEducationDetails = async (req: Request, res: Response) => {
  try {
    const {
      branch,
      enrollmentYear,
      cgpa,
      tenthPercent,
      tenthYear,
      twelfthPercent,
      twelfthYear,
      diplomaPercent,
      diplomaYear,
      backlogs,
    } = req.body;

    // Get Auth0 user id from token
    const auth0Id = req.auth?.payload.sub;
    console.log(auth0Id);
    if (!auth0Id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not logged in" });
    }

    // Find user in database
    // Find user, student profile, and education details in a single query using Prisma's relations
    const userWithProfileAndEducation = await db.user.findUnique({
      where: { auth0Id },
      include: {
        student: {
          include: {
            education: true,
          },
        },
      },
    });

    if (!userWithProfileAndEducation) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const profile = userWithProfileAndEducation.student;
    if (!profile) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const education = profile.education;
    if (!education) {
      return res.status(404).json({ error: "Education details not found" });
    }

    // Update education details
    const updatedEducation = await db.education.update({
      where: { studentId: profile.id },
      data: {
        branch: branch ?? education.branch,
        enrollmentYear: enrollmentYear
          ? Number(enrollmentYear)
          : education.enrollmentYear,
        cgpa: cgpa !== undefined ? Number(cgpa) : education.cgpa,
        tenthPercent:
          tenthPercent !== undefined
            ? Number(tenthPercent)
            : education.tenthPercent,
        tenthYear:
          tenthYear !== undefined ? Number(tenthYear) : education.tenthYear,
        twelfthPercent:
          twelfthPercent !== undefined
            ? Number(twelfthPercent)
            : education.twelfthPercent,
        twelfthYear:
          twelfthYear !== undefined
            ? Number(twelfthYear)
            : education.twelfthYear,
        diplomaPercent:
          diplomaPercent !== undefined
            ? Number(diplomaPercent)
            : education.diplomaPercent,
        diplomaYear:
          diplomaYear !== undefined
            ? Number(diplomaYear)
            : education.diplomaYear,
        backlogs:
          backlogs !== undefined ? Number(backlogs) : education.backlogs,
      },
    });

    return res.status(200).json({
      message: "Education details updated successfully",
      education: updatedEducation,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

//DELETE EDUCATION DETAILS CONTROLLER
export const deleteEducationDetails = async (req: Request, res: Response) => {
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

    // Find education details
    const education = await db.education.findUnique({
      where: { studentId: profile.id },
    });

    if (!education) {
      return res.status(404).json({ error: "Education details not found" });
    }

    // Delete education details
    await db.education.delete({ where: { studentId: profile.id } });

    return res
      .status(200)
      .json({ message: "Education details deleted successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};
