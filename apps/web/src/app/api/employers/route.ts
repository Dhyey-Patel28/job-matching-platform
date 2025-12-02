// apps/web/src/app/api/employers/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { sampleEmployers } from "@/data/sample";
import type { Employer } from "@/components/EmployerCard";

export async function GET() {
  try {
    const profiles = await prisma.employerProfile.findMany({
      include: {
        jobs: true,
      },
    });

    if (!profiles.length) {
      return NextResponse.json({ employers: sampleEmployers });
    }

    const employers: Employer[] = profiles.map((profile) => {
      const openRoles = profile.jobs.filter(
        (job) => job.status === "open" && job.isPublic,
      ).length;

      return {
        id: profile.userId,
        name: profile.companyName || "Unnamed company",
        industry: profile.hiringFor || "Various roles",
        openRoles,
        rating: undefined,
        location: profile.location || "Remote / flexible",
        about: undefined,
        benefits: [],
        website: profile.website || undefined,
      };
    });

    return NextResponse.json({ employers });
  } catch (error) {
    console.error("Error fetching employers, falling back to samples:", error);
    return NextResponse.json({ employers: sampleEmployers });
  }
}
