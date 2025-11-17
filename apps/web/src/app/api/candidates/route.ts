// apps/web/src/app/api/candidates/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import type { Candidate } from "@/components/CandidateCard";

export async function GET() {
  try {
    const rows = await prisma.user.findMany({
      where: {
        candidateProfile: { isNot: null },
      },
      include: { candidateProfile: true },
    });

    const candidates: Candidate[] = rows.map((row) => {
      const p = row.candidateProfile;
      return {
        id: row.id,
        name: p?.fullName || row.email,
        headline: p?.headline || undefined,
        location: p?.location || undefined,
        interests: p?.interests || undefined,
        resumeUrl: p?.resumeUrl || undefined,
      };
    });

    return NextResponse.json({ ok: true, candidates });
  } catch (err) {
    console.error("Error loading candidates:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load candidates." },
      { status: 500 },
    );
  }
}
