// apps/web/src/app/api/candidates/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";
import type { Candidate as CandidateCard } from "@/components/CandidateCard";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 },
    );
  }

  try {
    // Check the current account in the DB rather than trusting the token,
    // so deleted users and stale profile modes don't get access.
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { id: true, role: true, profileMode: true },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    // Only employer accounts browse candidates; candidate-only users get an
    // empty deck so the rest of Discover keeps working.
    const canBrowseCandidates =
      user.role === "recruiter" || user.profileMode !== "candidate";
    if (!canBrowseCandidates) {
      return NextResponse.json({ candidates: [] });
    }

    // Only candidates who are open to work, never myself
    const rows = await prisma.candidateProfile.findMany({
      where: { openToWork: true, userId: { not: user.id } },
      select: {
        userId: true,
        fullName: true,
        headline: true,
        location: true,
        interests: true,
      },
      orderBy: { user: { createdAt: "desc" } },
    });

    // Return only what the candidate card renders; no email-derived names.
    const candidates: CandidateCard[] = rows.map((row) => ({
      id: row.userId,
      name: row.fullName || "Candidate",
      headline: row.headline ?? "",
      location: row.location ?? "Location flexible",
      interests: row.interests ?? undefined,
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
