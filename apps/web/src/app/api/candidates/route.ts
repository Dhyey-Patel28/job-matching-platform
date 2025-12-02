// apps/web/src/app/api/candidates/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";
import type { Prisma } from "@prisma/client";
import type { Candidate as CandidateCard } from "@/components/CandidateCard";

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    const userId = session?.sub ?? null;

    // Only real candidates who are open to work
    const globalWhere: Prisma.CandidateProfileWhereInput = {
      openToWork: true,
    };

    // Discovery feed: hide myself if I’m also a candidate
    const discoveryWhere: Prisma.CandidateProfileWhereInput = {
      ...globalWhere,
      ...(userId ? { userId: { not: userId } } : {}),
    };

    const rows = await prisma.candidateProfile.findMany({
      where: discoveryWhere,
      include: { user: true },
      orderBy: { user: { createdAt: "desc" } },
    });

    const candidates: CandidateCard[] = rows.map((row) => ({
      id: row.userId,
      name: row.fullName || row.user.email.split("@")[0],
      headline: row.headline ?? "",
      location: row.location ?? "Location flexible",
      // CandidateCard.interests is `string | undefined`
      interests: row.interests ?? undefined,
      openToWork: row.openToWork,
    }));

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json(
      { candidates: [], error: "Failed to load candidates" },
      { status: 500 },
    );
  }
}
