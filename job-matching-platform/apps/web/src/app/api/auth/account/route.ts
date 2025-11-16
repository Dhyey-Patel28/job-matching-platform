import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function DELETE(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { userId } = body as { userId?: string };

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "userId is required." },
      { status: 400 },
    );
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ ok: true, message: "Account deleted." });
  } catch (err) {
    console.error("DELETE /api/auth/account error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to delete account." },
      { status: 500 },
    );
  }
}
