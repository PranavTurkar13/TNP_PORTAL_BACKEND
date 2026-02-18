import type { Request, Response } from "express";
import db from "../../client.js";
import { checkEligibility } from "../../utils/eligibility.js";

export const getAllJobsForAdmin = async (req: Request, res: Response) => {
  const jobs = await db.jobPost.findMany({
    include: {
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ jobs });
};

export const getJobByIdForAdmin = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: "Job ID required" });
    }

    const job = await db.jobPost.findUnique({
      where: { id: jobId },
      include: {
        eligibility: true,
        applications: true,
      },
    });

    if (!job || !job.eligibility) {
      return res.status(404).json({ error: "Job not found" });
    }

    const students = await db.studentProfile.findMany({
      include: {
        education: true,
        user: true,
      },
    });

    const eligibleStudents = students.filter((s) => {
      if (!s.education) return false;
      return checkEligibility(s.education, job.eligibility!).isEligible;
    });

    const appliedCount = job.applications.length;

    const appliedStudentIds = new Set(job.applications.map((a) => a.studentId));
    const eligibleNotAppliedCount = eligibleStudents.filter(
      (s) => !appliedStudentIds.has(s.id),
    ).length;

    res.json({
      job,
      stats: {
        eligible: eligibleStudents.length,
        applied: appliedCount,
        shortlisted: job.applications.filter((a) => a.status === "SHORTLISTED")
          .length,
        selected: job.applications.filter((a) => a.status === "SELECTED")
          .length,
        eligibleNotApplied: eligibleNotAppliedCount,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
export const notifyEligibleNotApplied = async (
  req: Request,
  res: Response
) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: "Job ID required" });
    }

    const job = await db.jobPost.findUnique({
      where: { id: jobId },
      include: {
        eligibility: true,
        applications: true,
      },
    });

    if (!job || !job.eligibility) {
      return res.status(404).json({ error: "Job not found" });
    }

    const students = await db.studentProfile.findMany({
      include: {
        education: true,
        user: true,
      },
    });

    const eligibleStudents = students.filter((s) => {
      if (!s.education) return false;
      return checkEligibility(s.education, job.eligibility!).isEligible;
    });

    const appliedStudentIds = new Set(
      job.applications.map((a) => a.studentId)
    );

    const eligibleNotApplied = eligibleStudents.filter(
      (s) => !appliedStudentIds.has(s.id)
    );

    const emails = eligibleNotApplied
      .map((s) => s.user?.email)
      .filter(Boolean);

    console.log("------ DEBUG NOTIFY ------");
    console.log("Job ID:", jobId);
    console.log("Eligible Students Count:", eligibleStudents.length);
    console.log("Applied Student IDs:", job.applications.map(a => a.studentId));
    console.log("Eligible Not Applied Count:", eligibleNotApplied.length);
    console.log("Emails:", emails);
    console.log("🔥 THIS IS LOCAL BACKEND");
    console.log("--------------------------");


    if (emails.length === 0) {
      return res.json({
        emails: [],
        subject: "",
        body: "",
      });
    }

    const subject = `Reminder: Apply for ${job.role} at ${job.company}`;

    const body = `
You are eligible for ${job.role} at ${job.company}.

CTC: ${job.ctc ?? "Not specified"}
Deadline: ${new Date(job.deadline).toDateString()}

Please login to the TNP Portal and apply before the deadline.
    `;

    return res.json({
      emails,
      subject,
      body,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

