import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { sampleEmployers } from "@/data/sample";
import type { Employer } from "@/components/EmployerCard";

export async function GET() {
  try {
    const existingCount = await prisma.employerListing.count();

    if (existingCount === 0) {
      // Seed DB once with sample employers.
      const data = sampleEmployers.map((employer) => ({
        payload: employer as unknown,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await prisma.employerListing.createMany({ data: data as any });
    }

    const rows = await prisma.employerListing.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (!rows.length) {
      // Fallback if something went wrong with seeding
      return NextResponse.json({ employers: sampleEmployers });
    }

    const employers: Employer[] = rows.map(
      (row) => row.payload as Employer,
    );

    return NextResponse.json({ employers });
  } catch (err) {
    console.error("Error fetching employers, falling back to samples:", err);
    return NextResponse.json({ employers: sampleEmployers });
  }
}
