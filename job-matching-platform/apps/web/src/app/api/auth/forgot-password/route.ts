import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import crypto from "crypto";

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

  const { email } = body as { email?: string };

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Email is required." },
      { status: 400 },
    );
  }

  const normalized = email.trim().toLowerCase();

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalized },
    });

    // Do NOT leak whether the user exists
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const resetUrl = `/reset-password?token=${encodeURIComponent(token)}`;

    // TODO in real life: send an email
    // For dev, we just return the URL so you can click it
    return NextResponse.json({
      ok: true,
      resetUrl,
    });
  } catch (err) {
    console.error("POST /api/auth/forgot-password error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to process request." },
      { status: 500 },
    );
  }
}
