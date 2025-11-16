// apps/web/src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { Prisma, Role, ProfileMode } from "@prisma/client";

type RegisterBody = {
  email?: string;
  password?: string;
  profileMode?: ProfileMode | string;
};

const ALLOWED_PROFILE_MODES: ProfileMode[] = [
  "candidate",
  "employer",
  "both",
];

export async function POST(request: Request) {
  let body: RegisterBody;

  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email and password are required." },
      { status: 400 },
    );
  }

  const mode: ProfileMode = ALLOWED_PROFILE_MODES.includes(
    body.profileMode as ProfileMode,
  )
    ? (body.profileMode as ProfileMode)
    : "candidate";

  // Derive backend role from profileMode
  const role: Role = mode === "candidate" ? "candidate" : "recruiter";

  try {
    // Make sure email is unique
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: "This email is already registered." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        profileMode: mode,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Registration successful.",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profileMode: user.profileMode,
      },
    });
  } catch (err) {
    console.error("Register error:", err);

    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      // Unique constraint (email) just in case
      return NextResponse.json(
        { ok: false, error: "This email is already registered." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { ok: false, error: "Failed to register. Please try again." },
      { status: 500 },
    );
  }
}
