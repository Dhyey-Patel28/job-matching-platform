import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { sampleJobs } from "@/data/sample";
import type { Job } from "@/components/JobCard";

export async function GET() {
  try {
    const existingCount = await prisma.jobListing.count();

    if (existingCount === 0) {
      // Seed DB once with sample jobs.
      const data = sampleJobs.map((job) => ({
        payload: job as unknown,
      }));

      // We only use this once to seed JSON blobs; keep it simple.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await prisma.jobListing.createMany({ data: data as any });
    }

    const rows = await prisma.jobListing.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (!rows.length) {
      // Fallback if something went wrong with seeding
      return NextResponse.json({ jobs: sampleJobs });
    }

    const jobs: Job[] = rows.map((row) => row.payload as Job);

    return NextResponse.json({ jobs });
  } catch (err) {
    console.error("Error fetching jobs, falling back to samples:", err);
    return NextResponse.json({ jobs: sampleJobs });
  }
}
