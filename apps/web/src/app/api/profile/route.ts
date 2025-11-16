// apps/web/src/app/api/profile/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import type { ProfileMode } from "@prisma/client";

type CandidateProfilePayload = {
  fullName: string;
  headline: string;
  location: string;
  interests: string;
  resumeUrl: string;
};

type EmployerProfilePayload = {
  companyName: string;
  roleTitle: string;
  location: string;
  website: string;
  hiringFor: string;
};

function normalizeCandidate(
  db:
    | {
        fullName: string | null;
        headline: string | null;
        location: string | null;
        interests: string | null;
        resumeUrl: string | null;
      }
    | null
    | undefined,
): CandidateProfilePayload | null {
  if (!db) return null;
  return {
    fullName: db.fullName ?? "",
    headline: db.headline ?? "",
    location: db.location ?? "",
    interests: db.interests ?? "",
    resumeUrl: db.resumeUrl ?? "",
  };
}

function normalizeEmployer(
  db:
    | {
        companyName: string | null;
        roleTitle: string | null;
        location: string | null;
        website: string | null;
        hiringFor: string | null;
      }
    | null
    | undefined,
): EmployerProfilePayload | null {
  if (!db) return null;
  return {
    companyName: db.companyName ?? "",
    roleTitle: db.roleTitle ?? "",
    location: db.location ?? "",
    website: db.website ?? "",
    hiringFor: db.hiringFor ?? "",
  };
}

// GET: load a specific user's profile by ?userId=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "userId is required." },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        candidateProfile: true,
        employerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        ok: true,
        profile: null,
      });
    }

    const profileMode = user.profileMode as ProfileMode;
    const candidate = normalizeCandidate(user.candidateProfile);
    const employer = normalizeEmployer(user.employerProfile);

    return NextResponse.json({
      ok: true,
      profile: {
        profileMode,
        candidate,
        employer,
      },
    });
  } catch (err) {
    console.error("Error loading profile:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load profile." },
      { status: 500 },
    );
  }
}

// POST: save a specific user's profile (userId is required)
export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { userId, profileMode, candidate, employer } = body as {
    userId?: string;
    profileMode?: string;
    candidate?: CandidateProfilePayload | null;
    employer?: EmployerProfilePayload | null;
  };

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "userId is required." },
      { status: 400 },
    );
  }

  const allowed: ProfileMode[] = ["candidate", "employer", "both"];

  if (!profileMode || !allowed.includes(profileMode as ProfileMode)) {
    return NextResponse.json(
      {
        ok: false,
        error: "profileMode must be 'candidate', 'employer', or 'both'.",
      },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: "No user found. Create an account before saving a profile.",
        },
        { status: 400 },
      );
    }

    const mode = profileMode as ProfileMode;

    // Update user's profileMode
    await prisma.user.update({
      where: { id: user.id },
      data: { profileMode: mode },
    });

    // Candidate profile
    if (candidate) {
      await prisma.candidateProfile.upsert({
        where: { userId: user.id },
        update: {
          fullName: candidate.fullName || null,
          headline: candidate.headline || null,
          location: candidate.location || null,
          interests: candidate.interests || null,
          resumeUrl: candidate.resumeUrl || null,
        },
        create: {
          userId: user.id,
          fullName: candidate.fullName || null,
          headline: candidate.headline || null,
          location: candidate.location || null,
          interests: candidate.interests || null,
          resumeUrl: candidate.resumeUrl || null,
        },
      });
    } else {
      // If candidate is null, clear it
      await prisma.candidateProfile.deleteMany({ where: { userId: user.id } });
    }

    // Employer profile
    if (employer) {
      await prisma.employerProfile.upsert({
        where: { userId: user.id },
        update: {
          companyName: employer.companyName || null,
          roleTitle: employer.roleTitle || null,
          location: employer.location || null,
          website: employer.website || null,
          hiringFor: employer.hiringFor || null,
        },
        create: {
          userId: user.id,
          companyName: employer.companyName || null,
          roleTitle: employer.roleTitle || null,
          location: employer.location || null,
          website: employer.website || null,
          hiringFor: employer.hiringFor || null,
        },
      });
    } else {
      await prisma.employerProfile.deleteMany({ where: { userId: user.id } });
    }

    const updated = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        candidateProfile: true,
        employerProfile: true,
      },
    });

    const candidateOut = normalizeCandidate(updated?.candidateProfile);
    const employerOut = normalizeEmployer(updated?.employerProfile);

    return NextResponse.json({
      ok: true,
      message: "Profile saved to database.",
      profile: {
        profileMode: mode,
        candidate: candidateOut,
        employer: employerOut,
      },
    });
  } catch (err) {
    console.error("Error saving profile:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to save profile.",
      },
      { status: 500 },
    );
  }
}
