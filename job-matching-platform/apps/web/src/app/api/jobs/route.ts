import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { sampleJobs } from "@/data/sample";
import type { Job } from "@/components/JobCard";
import type { EmployerProfile } from "@prisma/client";

/**
 * GET /api/jobs
 *
 * Returns job cards built from EmployerProfile rows.
 * If there are no employer profiles yet, falls back to the local sampleJobs.
 */
export async function GET() {
  try {
    const profiles = await prisma.employerProfile.findMany({
      orderBy: { userId: "asc" },
    });

    if (!profiles.length) {
      return NextResponse.json({ jobs: sampleJobs });
    }

    const jobs: Job[] = profiles.map((profile: EmployerProfile) => {
      const tags =
        profile.hiringFor
          ?.split(/[,/]/)
          .map((tag: string) => tag.trim())
          .filter(Boolean) ?? [];

      return {
        id: profile.userId,
        title: profile.roleTitle || "Open role",
        company: profile.companyName || "Unknown company",
        location: profile.location || "Remote / flexible",
        tags,
        summary: tags.length ? `Hiring for: ${tags.join(", ")}` : undefined,
      };
    });

    return NextResponse.json({ jobs });
  } catch (err) {
    console.error("Error fetching jobs, falling back to samples:", err);
    return NextResponse.json({ jobs: sampleJobs });
  }
}
