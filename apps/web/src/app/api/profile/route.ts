// apps/web/src/app/api/profile/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";

type ProfileMode = "candidate" | "employer" | "both";

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

// GET: load the logged-in user's profile (ignore ?userId=...)
export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated." },
      { status: 401 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      include: {
        candidateProfile: true,
        employerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ ok: true, profile: null });
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

// POST: save logged-in user's profile (ignore userId in body)
export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { profileMode, candidate, employer } = body as {
    profileMode?: string;
    candidate?: CandidateProfilePayload | null;
    employer?: EmployerProfilePayload | null;
  };

  if (!profileMode) {
    return NextResponse.json(
      { ok: false, error: "profileMode is required." },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found." },
        { status: 404 },
      );
    }

    const mode = profileMode as ProfileMode;

    await prisma.user.update({
      where: { id: user.id },
      data: { profileMode: mode },
    });

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
    }

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
    }

    // normalize output again
    const candidateOut = candidate ? normalizeCandidate(candidate) : null;
    const employerOut = employer ? normalizeEmployer(employer) : null;

    return NextResponse.json({
      ok: true,
      message: "Profile saved.",
      profile: {
        profileMode: mode,
        candidate: candidateOut,
        employer: employerOut,
      },
    });
  } catch (err) {
    console.error("Error saving profile:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to save profile." },
      { status: 500 },
    );
  }
}

