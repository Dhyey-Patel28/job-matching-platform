// apps/web/src/app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";
import type { Prisma } from "@prisma/client";
import { sampleJobs } from "@/data/sample";
import type { Job as JobCard } from "@/components/JobCard";

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    const userId = session?.sub ?? null;

    const globalWhere: Prisma.JobWhereInput = {
      status: "open",
      isPublic: true,
    };

    const discoveryWhere: Prisma.JobWhereInput = {
      ...globalWhere,
      ...(userId ? { employerUserId: { not: userId } } : {}),
    };

    const [rows, totalOpen] = await prisma.$transaction([
      prisma.job.findMany({
        where: discoveryWhere,
        include: {
          employer: true, // EmployerProfile
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.job.count({ where: globalWhere }),
    ]);

    // Only show sampleJobs if there are literally zero real open public jobs
    if (!rows.length && totalOpen === 0) {
      return NextResponse.json({ jobs: sampleJobs });
    }

    const jobs: JobCard[] = rows.map((row) => {
      const employer = row.employer;

      return {
        id: row.id,
        title: row.title,
        company: employer?.companyName || "Unknown company",
        location:
          row.location ||
          employer?.location ||
          "Remote / flexible",
        tags: row.tags ?? [],
        summary: row.description || undefined,
        employmentType:
          (row.employmentType as JobCard["employmentType"]) || undefined,

        salary: undefined,
        postedAt: undefined,
        experienceLevel: undefined,

        status: row.status as JobCard["status"],
        isPublic: row.isPublic,
      };
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs, falling back to samples:", error);
    return NextResponse.json({ jobs: sampleJobs });
  }
}
