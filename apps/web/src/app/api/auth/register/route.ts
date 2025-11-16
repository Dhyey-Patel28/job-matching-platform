// apps/web/src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";

type ProfileMode = "candidate" | "employer" | "both";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      profileMode?: ProfileMode | string;
    };

    if (!body.email || !body.password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required." },
        { status: 400 },
      );
    }

    const allowed: ProfileMode[] = ["candidate", "employer", "both"];
    const mode: ProfileMode =
      body.profileMode && allowed.includes(body.profileMode as ProfileMode)
        ? (body.profileMode as ProfileMode)
        : "candidate";

    // In a real app, insert the user + profileMode into your DB here.
    // For now we just echo back a success payload.
    return NextResponse.json({
      ok: true,
      message:
        "Registration accepted (demo). profileMode has been recorded in the payload only.",
      user: {
        email: body.email,
        profileMode: mode,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }
}
