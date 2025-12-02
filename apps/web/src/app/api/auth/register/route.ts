// apps/web/src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/server/db";
import { sendVerificationEmail } from "@/server/email";

type ProfileMode = "candidate" | "employer" | "both";

// Ensure this route runs on Node.js runtime (needed for nodemailer)
export const runtime = "nodejs";

type RegisterBody = {
  email?: string;
  password?: string;
  profileMode?: ProfileMode;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as RegisterBody | null;

  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  const profileMode = (body?.profileMode ?? "candidate") as ProfileMode;

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email and password are required." },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  if (!["candidate", "employer", "both"].includes(profileMode)) {
    return NextResponse.json(
      { ok: false, error: "Invalid profile mode." },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const role = profileMode === "candidate" ? "candidate" : "recruiter";

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        profileMode,
        emailVerified: false,
      },
    });

    // Create a verification token in DB
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

    console.log("Email verification URL:", verifyUrl);

    // Send via Nodemailer (SMTP)
    await sendVerificationEmail(email, verifyUrl);

    return NextResponse.json(
      {
        ok: true,
        message:
          "Registration successful. Please check your email to verify your account.",
        // Optional dev helper:
        verifyUrl:
          process.env.NODE_ENV === "development" ? verifyUrl : undefined,
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error("Error during registration:", err);
    const maybePrismaError = err as { code?: string };

    if (maybePrismaError && maybePrismaError.code === "P2002") {
      return NextResponse.json(
        {
          ok: false,
          error: "An account with that email already exists.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { ok: false, error: "Failed to register. Please try again later." },
      { status: 500 },
    );
  }
}
