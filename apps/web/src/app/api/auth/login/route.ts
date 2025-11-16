// apps/web/src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";

// Mirror your Prisma enums as simple string unions
type Role = "candidate" | "recruiter";
type ProfileMode = "candidate" | "employer" | "both";

type LoginBody = {
  email?: string;
  password?: string;
  remember?: boolean;
};

type LoginUserPayload = {
  id: string;
  email: string;
  role: Role;
  profileMode: ProfileMode;
};

export async function POST(request: Request) {
  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
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

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const payload: LoginUserPayload = {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      profileMode: user.profileMode as ProfileMode,
    };

    // Still a stateless demo: frontend stores this in localStorage.
    // Later you can add secure cookies / JWT here.
    return NextResponse.json({
      ok: true,
      user: payload,
      remember: !!body.remember,
      token: "demo-token-not-secure",
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to sign in. Please try again." },
      { status: 500 },
    );
  }
}
