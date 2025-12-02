import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { signSession } from "@/server/auth";

type Role = "candidate" | "recruiter";
type ProfileMode = "candidate" | "employer" | "both";

type LoginBody = {
  email?: string;
  password?: string;
  remember?: boolean;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as LoginBody | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { ok: false, error: "Email and password are required." },
      { status: 400 },
    );
  }

  const email = body.email.toLowerCase();

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials." },
        { status: 401 },
      );
    }

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials." },
        { status: 401 },
      );
    }

    // 🔴 require email verification
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          ok: false,
          needsVerification: true,
          error:
            "Please verify your email before signing in. Check your email for a verification link.",
        },
        { status: 403 },
      );
    }

    const token = signSession({
      sub: user.id,
      email: user.email,
      role: user.role as Role,
      profileMode: user.profileMode as ProfileMode,
      emailVerified: user.emailVerified,
      twoFactorPassed: true,
    });

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role as Role,
        profileMode: user.profileMode as ProfileMode,
        emailVerified: user.emailVerified,
      },
    });

    res.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to sign in. Please try again." },
      { status: 500 },
    );
  }
}
