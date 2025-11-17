// apps/web/src/app/api/swipes/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

type Direction = "left" | "right";
type TargetType = "job" | "candidate";

type SwipeBody = {
  userId?: string;
  targetType?: TargetType;
  targetId?: string;
  direction?: Direction;
};

export async function POST(request: Request) {
  let body: SwipeBody;

  try {
    body = (await request.json()) as SwipeBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { userId, targetType, targetId, direction } = body;

  if (!userId || !targetId || !targetType || !direction) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "userId, targetType, targetId, and direction are all required.",
      },
      { status: 400 },
    );
  }

  if (targetType !== "job" && targetType !== "candidate") {
    return NextResponse.json(
      { ok: false, error: "targetType must be 'job' or 'candidate'." },
      { status: 400 },
    );
  }

  if (direction !== "left" && direction !== "right") {
    return NextResponse.json(
      { ok: false, error: "direction must be 'left' or 'right'." },
      { status: 400 },
    );
  }

  try {
    await prisma.swipe.upsert({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType,
          targetId,
        },
      },
      update: {
        direction,
        createdAt: new Date(),
      },
      create: {
        userId,
        targetType,
        targetId,
        direction,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error recording swipe:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to record swipe." },
      { status: 500 },
    );
  }
}
