import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import bcrypt from "bcryptjs";

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

  const { token, password } = body as {
    token?: string;
    password?: string;
  };

  if (!token || !password) {
    return NextResponse.json(
      { ok: false, error: "token and password are required." },
      { status: 400 },
    );
  }

  try {
    const tokenRow = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!tokenRow || tokenRow.used || tokenRow.expiresAt < new Date()) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired token." },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRow.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: tokenRow.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ ok: true, message: "Password updated." });
  } catch (err) {
    console.error("POST /api/auth/reset-password error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to reset password." },
      { status: 500 },
    );
  }
}
