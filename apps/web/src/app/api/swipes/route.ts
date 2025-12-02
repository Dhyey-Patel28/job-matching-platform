// apps/web/src/app/api/swipes/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";

type SwipeDirection = "left" | "right";
type SwipeTargetType = "job" | "candidate";

export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 },
    );
  }

  const userId = session.sub;

  const body = (await req.json()) as {
    targetType?: SwipeTargetType;
    targetId?: string;
    direction?: SwipeDirection;
  };

  const { targetType, targetId, direction } = body;

  if (!targetType || !targetId || !direction) {
    return NextResponse.json(
      { ok: false, error: "Missing swipe parameters" },
      { status: 400 },
    );
  }

  if (direction !== "left" && direction !== "right") {
    return NextResponse.json(
      { ok: false, error: "Invalid direction" },
      { status: 400 },
    );
  }

  if (targetType !== "job" && targetType !== "candidate") {
    return NextResponse.json(
      { ok: false, error: "Invalid target type" },
      { status: 400 },
    );
  }

  try {
    // 1) Save / update the swipe itself
    const swipe = await prisma.swipe.upsert({
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

    let matchCreated = false;
    let matchId: string | null = null;
    let conversationId: string | null = null;

    // Only "right" swipes can create matches
    if (swipe.direction === "right") {
      // Candidate swiping on a Job
      if (swipe.targetType === "job") {
        const job = await prisma.job.findUnique({
          where: { id: swipe.targetId },
        });

        if (job) {
          // Has this employer already swiped right on this candidate?
          const employerRightSwipe = await prisma.swipe.findFirst({
            where: {
              userId: job.employerUserId,
              targetType: "candidate",
              targetId: userId,
              direction: "right",
            },
          });

          if (employerRightSwipe) {
            const match = await prisma.match.upsert({
              where: {
                candidateId_employerId_jobId: {
                  candidateId: userId,
                  employerId: job.employerUserId,
                  jobId: job.id,
                },
              },
              update: {},
              create: {
                candidateId: userId,
                employerId: job.employerUserId,
                jobId: job.id,
              },
            });

            matchId = match.id;
            matchCreated = true;

            // Ensure a conversation exists
            const convo = await prisma.conversation.upsert({
              where: { matchId: match.id },
              update: {},
              create: { matchId: match.id },
            });

            conversationId = convo.id;
          }
        }
      }

      // Employer swiping on a Candidate
      if (swipe.targetType === "candidate") {
        const candidateId = swipe.targetId;

        // All open jobs for this employer
        const employerJobs = await prisma.job.findMany({
          where: {
            employerUserId: userId,
            status: "open",
          },
          select: { id: true },
        });

        const employerJobIds = employerJobs.map((j) => j.id);

        if (employerJobIds.length > 0) {
          // Has the candidate swiped right on any of this employer's jobs?
          const candidateRightSwipe = await prisma.swipe.findFirst({
            where: {
              userId: candidateId,
              targetType: "job",
              direction: "right",
              targetId: { in: employerJobIds },
            },
            orderBy: { createdAt: "desc" },
          });

          if (candidateRightSwipe) {
            const jobId = candidateRightSwipe.targetId;

            const match = await prisma.match.upsert({
              where: {
                candidateId_employerId_jobId: {
                  candidateId,
                  employerId: userId,
                  jobId,
                },
              },
              update: {},
              create: {
                candidateId,
                employerId: userId,
                jobId,
              },
            });

            matchId = match.id;
            matchCreated = true;

            const convo = await prisma.conversation.upsert({
              where: { matchId: match.id },
              update: {},
              create: { matchId: match.id },
            });

            conversationId = convo.id;
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      swipe,
      matchCreated,
      matchId,
      conversationId,
    });
  } catch (err) {
    console.error("Error handling swipe:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to record swipe" },
      { status: 500 },
    );
  }
}
