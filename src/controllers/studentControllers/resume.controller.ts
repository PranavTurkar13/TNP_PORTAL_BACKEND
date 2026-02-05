import type { Request, Response } from "express";
import db from "../../client.js";
import { Document, Packer, Paragraph, TextRun } from "docx";

export const downloadResume = async (req: Request, res: Response) => {
  try {
    const auth0Id = req.auth?.payload.sub;

    if (!auth0Id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await db.user.findUnique({
      where: { auth0Id },
      include: {
        student: {
          include: {
            education: true,
            internships: true,
            achievements: true,
            projects: true,
            certifications: true,
            socials: true,
          },
        },
      },
    });

    if (!user || !user.student) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const profile = user.student;

    const sections: Paragraph[] = [];

    // ===== HEADER =====
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${profile.firstName} ${profile.middleName || ""} ${profile.lastName}`,
            bold: true,
          }),
        ],
      }),
    );

    sections.push(
      new Paragraph(
        `${profile.personalEmail || ""} | ${profile.phoneNo || ""}`,
      ),
    );

    sections.push(new Paragraph("Pune, India • Open to remote"));
    sections.push(new Paragraph(""));

    // ===== SOCIALS =====
    if (profile.socials.length > 0) {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: "Social Links", bold: true })],
        }),
      );

      profile.socials.forEach((s) => {
        sections.push(new Paragraph(`${s.platform}: ${s.url}`));
      });

      sections.push(new Paragraph(""));
    }

    // ===== EXPERIENCE =====
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "Experience", bold: true })],
      }),
    );

    if (profile.internships.length === 0) {
      sections.push(new Paragraph("No experience added yet"));
    } else {
      profile.internships.forEach((i) => {
        sections.push(new Paragraph(`${i.role} - ${i.company}`));
        if (i.description) sections.push(new Paragraph(i.description));
        if (i.duration) sections.push(new Paragraph(`Duration: ${i.duration}`));
        sections.push(new Paragraph(""));
      });
    }

    // ===== ACHIEVEMENTS =====
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "Achievements", bold: true })],
      }),
    );

    if (profile.achievements.length === 0) {
      sections.push(new Paragraph("No achievements added yet"));
    } else {
      profile.achievements.forEach((a) => {
        sections.push(
          new Paragraph(
            `${a.title} ${
              a.date ? `(${new Date(a.date).toLocaleDateString()})` : ""
            }`,
          ),
        );
        if (a.type) sections.push(new Paragraph(a.type));
        if (a.description) sections.push(new Paragraph(a.description));
        sections.push(new Paragraph(""));
      });
    }

    // ===== PROJECTS =====
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "Projects", bold: true })],
      }),
    );

    if (profile.projects.length === 0) {
      sections.push(new Paragraph("No projects added yet"));
    } else {
      profile.projects.forEach((p) => {
        sections.push(new Paragraph(p.title));
        if (p.description) sections.push(new Paragraph(p.description));
        if (p.techStack?.length)
          sections.push(new Paragraph(`Tech: ${p.techStack.join(", ")}`));
        if (p.link) sections.push(new Paragraph(`Link: ${p.link}`));
        sections.push(new Paragraph(""));
      });
    }

    // ===== EDUCATION =====
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "Education", bold: true })],
      }),
    );

    if (profile.education) {
      sections.push(
        new Paragraph(
          `B.E in ${profile.education.branch} | CGPA - ${profile.education.cgpa}`,
        ),
      );
      sections.push(
        new Paragraph(
          `P.E.S Modern College of Engineering, Pune • ${profile.education.enrollmentYear} - ${profile.education.passingYear}`,
        ),
      );
    }

    sections.push(new Paragraph(""));

    // ===== SKILLS =====
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "Skills", bold: true })],
      }),
    );

    if (profile.skills.length > 0) {
      sections.push(new Paragraph(profile.skills.join(", ")));
    } else {
      sections.push(new Paragraph("No skills added yet"));
    }

    // ===== CREATE DOC =====
    const doc = new Document({
      sections: [
        {
          children: sections,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    res.setHeader("Content-Disposition", "attachment; filename=resume.docx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );

    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
