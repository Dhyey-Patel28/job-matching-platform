// apps/web/src/app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { sampleJobs } from "@/data/sample";
import { prisma } from "@/server/db";
import type { Prisma } from "@prisma/client";   // 👈 add this
import type { Job } from "@/components/JobCard";

export async function GET() {
  try {
    // If there are no rows yet, seed from sampleJobs
    const existingCount = await prisma.jobListing.count();

    if (existingCount === 0) {
      await prisma.jobListing.createMany({
        data: sampleJobs.map((job) => ({
          // Prisma expects JsonNull | InputJsonValue here
          payload: job as Prisma.InputJsonValue,   // 👈 key change
        })),
      });
    }

    const rows = await prisma.jobListing.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (!rows.length) {
      // Safety fallback — shouldn't normally hit if seeding worked
      return NextResponse.json({ jobs: sampleJobs });
    }

    // payload is JsonValue at runtime; we know it's shaped like Job
    const jobs = rows.map((row) => row.payload as Job);

    return NextResponse.json({ jobs });
  } catch (err) {
    console.error("Error fetching jobs, falling back to samples:", err);
    return NextResponse.json({ jobs: sampleJobs });
  }
}
