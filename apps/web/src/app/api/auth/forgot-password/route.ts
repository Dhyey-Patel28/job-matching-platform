// apps/web/src/app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/server/db";
import { sendPasswordResetEmail } from "@/server/email";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Email is required." },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Security: never reveal whether the account exists
    if (!user) {
      return NextResponse.json(
        {
          ok: true,
          message:
            "If an account exists for that email, you'll receive a reset link.",
        },
        { status: 200 },
      );
    }

    // Optional: invalidate any previous live tokens
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
      data: { used: true },
    });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json(
      {
        ok: true,
        message:
          "If an account exists for that email, you'll receive a reset link.",
        // Keep this for local dev convenience:
        resetUrl:
          process.env.NODE_ENV === "development" ? resetUrl : undefined,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in forgot-password:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to process request." },
      { status: 500 },
    );
  }
}
