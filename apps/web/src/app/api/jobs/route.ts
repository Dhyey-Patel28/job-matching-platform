// apps/web/src/app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { sampleJobs } from "@/data/sample";
import type { Job } from "@/components/JobCard";
import type { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const existingCount = await prisma.jobListing.count();

    if (existingCount === 0) {
      // Seed DB once with sample jobs.
      // Cast through `unknown` → Prisma.JobListingCreateManyInput[] to keep
      // ESLint happy (no `any`) while telling Prisma "this is valid JSON".
      const data = sampleJobs.map(
        (job) =>
          ({
            payload: job,
          } as unknown as Prisma.JobListingCreateManyInput),
      );

      await prisma.jobListing.createMany({ data });
    }

    const rows = await prisma.jobListing.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (!rows.length) {
      return NextResponse.json({ jobs: sampleJobs });
    }

    const jobs = rows.map(
      (row: { payload: unknown }) => row.payload as Job,
    );

    return NextResponse.json({ jobs });
  } catch (err) {
    console.error("Error fetching jobs, falling back to samples:", err);
    return NextResponse.json({ jobs: sampleJobs });
  }
}
