import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import type { Candidate } from "@/components/CandidateCard";
import type { CandidateProfile } from "@prisma/client";

/**
 * GET /api/candidates
 *
 * Returns candidate cards built from CandidateProfile rows.
 */
export async function GET() {
  try {
    const profiles = await prisma.candidateProfile.findMany({
      orderBy: { userId: "asc" },
    });

    const candidates: Candidate[] = profiles.map((profile: CandidateProfile) => ({
      id: profile.userId,
      name: profile.fullName || "Anonymous candidate",
      headline: profile.headline ?? undefined,
      location: profile.location ?? undefined,
      interests: profile.interests ?? undefined,
      resumeUrl: profile.resumeUrl ?? undefined,
    }));

    return NextResponse.json({ candidates });
  } catch (err) {
    console.error("Error fetching candidates:", err);
    return NextResponse.json({ candidates: [] });
  }
}
