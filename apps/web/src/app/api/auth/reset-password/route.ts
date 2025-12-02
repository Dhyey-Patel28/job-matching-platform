// apps/web/src/app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";

type ResetBody = {
  token?: string;
  password?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as ResetBody | null;
  const token = body?.token ?? "";
  const password = body?.password ?? "";

  if (!token || !password) {
    return NextResponse.json(
      { ok: false, error: "Missing token or password." },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  try {
    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record || record.used || record.expiresAt < new Date()) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired reset token." },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json(
      { ok: true, message: "Password has been reset." },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in reset-password:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to reset password." },
      { status: 500 },
    );
  }
}
