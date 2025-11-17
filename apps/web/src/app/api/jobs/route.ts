import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { sampleJobs } from "@/data/sample";
import type { Job } from "@/components/JobCard";

/**
 * GET /api/jobs
 *
 * Returns job cards from the JobListing table.
 * On first run, seeds the table from sampleJobs.
 */
export async function GET() {
  try {
    // Seed once, if needed
    const existingCount = await prisma.jobListing.count();

    if (existingCount === 0) {
      const data = sampleJobs.map((job) => ({
        payload: job, // whole Job object as JSON
      }));

      await prisma.jobListing.createMany({ data });
    }

    const rows = await prisma.jobListing.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (!rows.length) {
      // Absolute fallback if DB is empty for some reason
      return NextResponse.json({ jobs: sampleJobs });
    }

    type JobListingRow = Awaited<
      ReturnType<(typeof prisma)["jobListing"]["findMany"]>
    >[number];

    const jobs: Job[] = rows.map((row: JobListingRow) => row.payload as Job);
    return NextResponse.json({ jobs });
  } catch (err) {
    console.error("Error fetching jobs, falling back to samples:", err);
    return NextResponse.json({ jobs: sampleJobs });
  }
}
