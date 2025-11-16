// apps/web/src/app/api/employers/route.ts
import { NextResponse } from "next/server";
import { sampleEmployers } from "@/data/sample";
import { prisma } from "@/server/db";
import type { Prisma } from "@prisma/client";    // 👈 add this
import type { Employer } from "@/components/EmployerCard";

export async function GET() {
  try {
    const existingCount = await prisma.employerListing.count();

    if (existingCount === 0) {
      await prisma.employerListing.createMany({
        data: sampleEmployers.map((employer) => ({
          payload: employer as Prisma.InputJsonValue,   // 👈 key change
        })),
      });
    }

    const rows = await prisma.employerListing.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (!rows.length) {
      return NextResponse.json({ employers: sampleEmployers });
    }

    const employers = rows.map((row) => row.payload as Employer);

    return NextResponse.json({ employers });
  } catch (err) {
    console.error("Error fetching employers, falling back to samples:", err);
    return NextResponse.json({ employers: sampleEmployers });
  }
}
