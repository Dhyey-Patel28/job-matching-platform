// apps/web/src/app/api/matches/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 },
    );
  }

  const userId = session.sub;

  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ candidateId: userId }, { employerId: userId }],
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        candidate: {
          select: {
            id: true,
            email: true,
            role: true,
            candidateProfile: {
              select: { fullName: true },
            },
          },
        },
        employer: {
          select: {
            id: true,
            email: true,
            role: true,
            employerProfile: {
              select: { companyName: true, roleTitle: true },
            },
          },
        },
        conversations: {
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = matches.map((m) => {
      const convo = m.conversations[0];
      const lastMsg = convo?.messages[convo.messages.length - 1];

      const unreadCount = convo
        ? convo.messages.filter(
            (msg) => msg.senderId !== userId && msg.readAt == null,
          ).length
        : 0;

      const isCurrentCandidate = m.candidateId === userId;

      const displayName = isCurrentCandidate
        ? m.employer.employerProfile?.companyName ||
          m.employer.employerProfile?.roleTitle ||
          m.employer.email.split("@")[0]
        : m.candidate.candidateProfile?.fullName ||
          m.candidate.email.split("@")[0];

      const otherUser = isCurrentCandidate ? m.employer : m.candidate;

      return {
        id: m.id,
        status: m.status,
        job: {
          id: m.job.id,
          title: m.job.title,
        },
        otherUser: {
          id: otherUser.id,
          email: otherUser.email,
          role: otherUser.role,
          name: displayName,
        },
        conversationId: convo?.id ?? null,
        lastMessage: lastMsg
          ? {
              id: lastMsg.id,
              body: lastMsg.body,
              createdAt: lastMsg.createdAt,
              senderId: lastMsg.senderId,
            }
          : null,
        unreadCount,
      };
    });

    const summary = {
      total: formatted.length,
      totalUnread: formatted.reduce(
        (sum, m) => sum + (m.unreadCount ?? 0),
        0,
      ),
    };

    return NextResponse.json({ ok: true, matches: formatted, summary });
  } catch (err) {
    console.error("Error in GET /api/matches:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load matches" },
      { status: 500 },
    );
  }
}
