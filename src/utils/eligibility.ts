import type { Education, EligibilityCriteria } from "@prisma/client";

export function checkEligibility(
  education: Education,
  eligibility: EligibilityCriteria,
) {
  const reasons: string[] = [];

  if (eligibility.minCGPA !== null && education.cgpa < eligibility.minCGPA) {
    reasons.push(`CGPA < ${eligibility.minCGPA}`);
  }

  if (
    eligibility.minTenth !== null &&
    education.tenthPercent !== null &&
    education.tenthPercent < eligibility.minTenth
  ) {
    reasons.push(`10th % < ${eligibility.minTenth}`);
  }

  const has12th = education.twelfthPercent != null;

  if (has12th) {
    if (
      eligibility.minTwelfth !== null &&
      education.twelfthPercent! < eligibility.minTwelfth
    ) {
      reasons.push(`12th % < ${eligibility.minTwelfth}`);
    }
  } else {
    if (
      eligibility.minDiploma != null &&
      education.diplomaPercent! < eligibility.minDiploma
    ) {
      reasons.push(`Diploma % < ${eligibility.minDiploma}`);
    }
  }

  if (
    eligibility.passingYear &&
    education.passingYear !== eligibility.passingYear
  ) {
    reasons.push(`Passing year mismatch`);
  }

  if (
    eligibility.maxBacklogs !== null &&
    education.backlogs > eligibility.maxBacklogs
  ) {
    reasons.push(`Backlogs > ${eligibility.maxBacklogs}`);
  }

  if (
    eligibility.allowedBranches.length > 0 &&
    !eligibility.allowedBranches.some(
      (b) =>
        b === "All" || education.branch.toLowerCase().includes(b.toLowerCase()),
    )
  ) {
    reasons.push(`Branch not allowed`);
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
  };
}
