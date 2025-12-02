// apps/web/src/app/api/messages/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth";

type ConversationWithRelations = {
  id: string;
  matchId: string;
  createdAt: Date;
  match: {
    id: string;
    candidateId: string;
    employerId: string;
  };
  messages: {
    id: string;
    conversationId: string;
    senderId: string;
    body: string;
    createdAt: Date;
    readAt: Date | null;
  }[];
};

/**
 * GET /api/messages?conversationId=... or ?matchId=...
 * - Returns all messages in a conversation (and marks others' messages as read).
 */
export async function GET(req: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 },
    );
  }

  const url = new URL(req.url);
  const conversationId = url.searchParams.get("conversationId") || undefined;
  const matchId = url.searchParams.get("matchId") || undefined;

  if (!conversationId && !matchId) {
    return NextResponse.json(
      { ok: false, error: "conversationId or matchId required" },
      { status: 400 },
    );
  }

  const userId = session.sub;

  try {
    let conversation: ConversationWithRelations | null = null;

    // 1) Try direct lookup by conversationId
    if (conversationId) {
      const data = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          match: true,
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (data) {
        conversation = data as ConversationWithRelations;
      }
    }

    // 2) If not found but we have a matchId, ensure the match belongs to user,
    //    then upsert a conversation for that match.
    if (!conversation && matchId) {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
      });

      if (!match) {
        return NextResponse.json(
          { ok: false, error: "Match not found" },
          { status: 404 },
        );
      }

      if (match.candidateId !== userId && match.employerId !== userId) {
        return NextResponse.json(
          { ok: false, error: "Not allowed to view this match" },
          { status: 403 },
        );
      }

      const convoData = await prisma.conversation.upsert({
        where: { matchId: match.id },
        update: {},
        create: { matchId: match.id },
        include: {
          match: true,
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      conversation = convoData as ConversationWithRelations;
    }

    if (!conversation) {
      return NextResponse.json(
        { ok: false, error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Extra safety: make sure current user is part of the match
    if (
      conversation.match.candidateId !== userId &&
      conversation.match.employerId !== userId
    ) {
      return NextResponse.json(
        { ok: false, error: "Not allowed to view this conversation" },
        { status: 403 },
      );
    }

    // Mark other user's unread messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: conversation.id,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return NextResponse.json({
      ok: true,
      conversationId: conversation.id,
      matchId: conversation.matchId,
      messages: conversation.messages,
    });
  } catch (err) {
    console.error("Error in GET /api/messages:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load messages" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/messages
 * Body: { conversationId?: string; matchId?: string; message: string }
 * - Sends a message in a conversation (creates conversation if only matchId is given).
 */
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
    conversationId?: string;
    matchId?: string;
    message?: string;
  };

  const text = (body.message ?? "").trim();

  if (!text) {
    return NextResponse.json(
      { ok: false, error: "Message text is required" },
      { status: 400 },
    );
  }

  if (!body.conversationId && !body.matchId) {
    return NextResponse.json(
      { ok: false, error: "conversationId or matchId is required" },
      { status: 400 },
    );
  }

  try {
    let conversationId = body.conversationId;
    let matchId = body.matchId;

    // 1) No conversationId: ensure match belongs to user then upsert conversation
    if (!conversationId) {
      const match = await prisma.match.findUnique({
        where: { id: matchId! },
      });

      if (!match) {
        return NextResponse.json(
          { ok: false, error: "Match not found" },
          { status: 404 },
        );
      }

      if (match.candidateId !== userId && match.employerId !== userId) {
        return NextResponse.json(
          { ok: false, error: "Not allowed to use this match" },
          { status: 403 },
        );
      }

      const convo = await prisma.conversation.upsert({
        where: { matchId: match.id },
        update: {},
        create: { matchId: match.id },
      });

      conversationId = convo.id;
      matchId = match.id;
    } else {
      // 2) We do have a conversationId: verify membership through its match
      const convo = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { match: true },
      });

      if (!convo) {
        return NextResponse.json(
          { ok: false, error: "Conversation not found" },
          { status: 404 },
        );
      }

      if (
        convo.match.candidateId !== userId &&
        convo.match.employerId !== userId
      ) {
        return NextResponse.json(
          { ok: false, error: "Not allowed to use this conversation" },
          { status: 403 },
        );
      }

      matchId = convo.matchId;
      conversationId = convo.id;
    }

    const msg = await prisma.message.create({
      data: {
        conversationId: conversationId!,
        senderId: userId,
        body: text,
      },
    });

    return NextResponse.json({
      ok: true,
      conversationId,
      matchId,
      message: msg,
    });
  } catch (err) {
    console.error("Error in POST /api/messages:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to send message" },
      { status: 500 },
    );
  }
}
