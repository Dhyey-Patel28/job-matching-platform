import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET() {
  try {
    // Simple DB ping
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      env: process.env.NODE_ENV ?? "unknown",
    });
  } catch (err) {
    console.error("Health check failed:", err);
    return NextResponse.json(
      { ok: false, error: "Database not reachable" },
      { status: 500 },
    );
  }
}
