// apps/web/src/app/api/profile/route.ts
import { NextResponse } from "next/server";

type ProfileMode = "candidate" | "employer" | "both";

type CandidateProfile = {
  fullName: string;
  headline: string;
  location: string;
  interests: string;
  resumeUrl: string;
};

type EmployerProfile = {
  companyName: string;
  roleTitle: string;
  location: string;
  website: string;
  hiringFor: string;
};

// Demo in-memory store.
// IMPORTANT: On Vercel this is NOT a real database – it can reset between invocations.
let lastProfile:
  | {
      profileMode: ProfileMode;
      candidate: CandidateProfile | null;
      employer: EmployerProfile | null;
    }
  | null = null;

export async function GET() {
  return NextResponse.json({
    ok: true,
    profile: lastProfile,
  });
}

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

  const { profileMode, candidate, employer } = body as {
    profileMode?: string;
    candidate?: CandidateProfile | null;
    employer?: EmployerProfile | null;
  };

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

  lastProfile = {
    profileMode: profileMode as ProfileMode,
    candidate: candidate ?? null,
    employer: employer ?? null,
  };

  return NextResponse.json({
    ok: true,
    message:
      "Profile saved in demo backend only. Wire this to a real database later.",
    profile: lastProfile,
  });
}
