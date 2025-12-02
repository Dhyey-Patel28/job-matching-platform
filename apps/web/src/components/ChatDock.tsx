// apps/web/src/components/ChatDock.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type MatchStatus = "active" | "interviewing" | "rejected" | "hired";

type MatchSummary = {
  id: string;
  status: MatchStatus;
  job: { id: string; title: string };
  otherUser: {
    id: string;
    email: string;
    role: "candidate" | "recruiter";
    name: string;
  };
  conversationId: string | null;
  lastMessage: {
    id: string;
    body: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
};

type ChatMessage = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  readAt: string | null;
};

type MatchesResponse = {
  ok: boolean;
  error?: string;
  matches: MatchSummary[];
  summary: { total: number; totalUnread: number };
};

type MessagesResponse = {
  ok: boolean;
  error?: string;
  conversationId: string;
  matchId: string;
  messages: ChatMessage[];
};

// Turn URLs into clickable links
function renderMessageBody(text: string) {
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlPattern);

  return parts.map((part, idx) => {
    const isUrl =
      part.startsWith("http://") || part.startsWith("https://");

    if (isUrl) {
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noreferrer"
          className="underline break-all"
        >
          {part}
        </a>
      );
    }

    return <span key={idx}>{part}</span>;
  });
}

export default function ChatDock() {
  const [open, setOpen] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [summary, setSummary] = useState<{
    total: number;
    totalUnread: number;
  } | null>(null);

  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] =
    useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendText, setSendText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeMatch = matches.find((m) => m.id === activeMatchId) ?? null;

  // Refs for scrolling
  const matchRowRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollMatches = (direction: "left" | "right") => {
    const el = matchRowRef.current;
    if (!el) return;
    const amount = 180;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const scrollMessagesToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  // Load match list
  const loadMatches = async () => {
    try {
      setLoadingMatches(true);
      setError(null);

      const res = await fetch("/api/matches");
      const data = (await res.json().catch(() => null)) as
        | MatchesResponse
        | null;

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? "Failed to load matches");
      }

      setMatches(data.matches);
      setSummary(data.summary);

      // Keep existing active match if still present
      if (activeMatchId) {
        const stillExists = data.matches.some(
          (m) => m.id === activeMatchId,
        );
        if (!stillExists) {
          setActiveMatchId(null);
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Error loading matches:", err);
      setError("Could not load matches.");
      setMatches([]);
      setSummary(null);
    } finally {
      setLoadingMatches(false);
    }
  };

  // Load messages for a given match
  const loadMessagesForMatch = async (match: MatchSummary) => {
    if (!match) return;
    try {
      setLoadingMessages(true);
      setError(null);

      const params = new URLSearchParams();
      if (match.conversationId) {
        params.set("conversationId", match.conversationId);
      } else {
        params.set("matchId", match.id);
      }

      const res = await fetch(`/api/messages?${params.toString()}`);
      const data = (await res.json().catch(() => null)) as
        | MessagesResponse
        | null;

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? "Failed to load messages");
      }

      setActiveMatchId(match.id);
      setActiveConversationId(data.conversationId);
      setMessages(data.messages);
      // Scroll to bottom on first load
      setTimeout(scrollMessagesToBottom, 0);
    } catch (err) {
      console.error("Error loading messages:", err);
      setError("Could not load messages.");
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    const text = sendText.trim();
    if (!text || !activeMatchId) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          matchId: activeMatchId,
          message: text,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | {
            ok?: boolean;
            message?: ChatMessage;
            error?: string;
            conversationId?: string;
          }
        | null;

      if (!res.ok || !data || !data.ok || !data.message || !data.conversationId) {
        throw new Error(data?.error ?? "Failed to send message");
      }

      const newMessage: ChatMessage = data.message;
      const newConversationId = data.conversationId;

      setActiveConversationId(newConversationId);
      setMessages((prev) => [...prev, newMessage]);
      setSendText("");

      // After sending, refresh matches so unread counts stay correct
      void loadMatches();

      // Scroll to bottom after sending
      setTimeout(scrollMessagesToBottom, 0);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Could not send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleInterviewInvite = async () => {
    if (!activeMatchId) return;

    const when = window.prompt(
      "When would you like to meet? (e.g. Fri 3–3:30 PM ET)",
    );
    if (!when) return;

    const link =
      window.prompt("Paste your Zoom/Meet/Teams link (optional):")
        ?.trim() ?? "";

    const inviteText = link
      ? `Interview invite: ${when}\nMeeting link: ${link}`
      : `Interview invite: ${when}`;

    setSendText(inviteText);
    await handleSend();
  };

  // Initial load
  useEffect(() => {
    void loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh when opening the dock
  useEffect(() => {
    if (open) {
      void loadMatches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (!open || !activeMatchId) return;
    scrollMessagesToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // POLLING: keep messages live while popup is open and a conversation is active
  useEffect(() => {
    if (!open || !activeConversationId) return;

    const intervalId = window.setInterval(async () => {
      try {
        const params = new URLSearchParams();
        params.set("conversationId", activeConversationId);

        const res = await fetch(`/api/messages?${params.toString()}`);
        const data = (await res.json().catch(() => null)) as
          | MessagesResponse
          | null;

        if (!res.ok || !data?.ok) {
          return;
        }

        setMessages((prev) => {
          const prevLen = prev.length;
          const nextLen = data.messages.length;
          const prevLast = prevLen > 0 ? prev[prevLen - 1] : undefined;
          const nextLast =
            nextLen > 0 ? data.messages[nextLen - 1] : undefined;

          if (
            prevLen === nextLen &&
            prevLast &&
            nextLast &&
            prevLast.id === nextLast.id
          ) {
            return prev; // no change
          }

          return data.messages;
        });
      } catch (err) {
        console.error("Error polling messages:", err);
      }
    }, 4000); // 4s or even 10s polling

    return () => window.clearInterval(intervalId);
  }, [open, activeConversationId]);

  return (
    <>
      {/* Chat icon + badge in header */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/15 text-sm text-white shadow-sm backdrop-blur transition hover:bg-white/25 active:translate-y-px"
        aria-label="Open messages"
      >
        <span className="text-lg leading-none">💬</span>
        {summary && summary.total > 0 && (
          <span className="pointer-events-none absolute -top-1 -right-1 inline-flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white shadow">
            {summary.total > 9 ? "9+" : summary.total}
          </span>
        )}
      </button>

      {/* Full-screen overlay + centered modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="flex w-full max-w-[520px] max-h-[80vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
              <div>
                <p className="text-xs font-semibold text-gray-900">
                  Matches &amp; messages
                </p>
                <p className="text-[11px] text-gray-500">
                  {summary
                    ? `${summary.total} match${
                        summary.total === 1 ? "" : "es"
                      } · ${summary.totalUnread} unread`
                    : "No matches yet"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-[10px] text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Body: match list + messages */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Match list with carousel controls */}
              <div className="border-b border-gray-100 px-3 py-2">
                <div className="flex items-center gap-1">
                  {matches.length > 3 && (
                    <button
                      type="button"
                      onClick={() => scrollMatches("left")}
                      className="hidden h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-[11px] text-gray-500 hover:bg-gray-100 sm:flex"
                    >
                      ‹
                    </button>
                  )}

                  <div
                    ref={matchRowRef}
                    className="flex gap-1 overflow-x-auto pb-1"
                  >
                    {loadingMatches && (
                      <span className="px-2 py-1 text-[11px] text-gray-500">
                        Loading…
                      </span>
                    )}

                    {!loadingMatches && matches.length === 0 && (
                      <span className="px-2 py-1 text-[11px] text-gray-500">
                        No matches yet. Keep swiping!
                      </span>
                    )}

                    {matches.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => loadMessagesForMatch(m)}
                        className={[
                          "relative inline-flex min-w-[140px] flex-col items-start rounded-xl border px-2 py-1.5 text-left",
                          m.id === activeMatchId
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-200 bg-gray-50 text-gray-800 hover:border-gray-400",
                        ].join(" ")}
                      >
                        <span className="line-clamp-1 text-[11px] font-semibold">
                          {m.otherUser.name}
                        </span>
                        <span className="line-clamp-1 text-[10px] opacity-80">
                          {m.job.title}
                        </span>
                        {m.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-semibold text-white">
                            {m.unreadCount > 9 ? "9+" : m.unreadCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {matches.length > 3 && (
                    <button
                      type="button"
                      onClick={() => scrollMatches("right")}
                      className="hidden h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-[11px] text-gray-500 hover:bg-gray-100 sm:flex"
                    >
                      ›
                    </button>
                  )}
                </div>
              </div>

              {/* Messages area */}
              <div className="flex flex-1 flex-col">
                {/* Fixed-height scrollable messages list */}
                <div className="flex-1 overflow-y-auto px-4 py-3 max-h-[52vh]">
                  {error && (
                    <p className="mb-2 rounded-lg bg-rose-50 px-2 py-1 text-[11px] text-rose-700">
                      {error}
                    </p>
                  )}

                  {loadingMessages && (
                    <p className="text-[11px] text-gray-500">
                      Loading messages…
                    </p>
                  )}

                  {!loadingMessages && !activeMatch && (
                    <p className="text-[11px] text-gray-500">
                      Select a match above to start chatting.
                    </p>
                  )}

                  {!loadingMessages &&
                    activeMatch &&
                    messages.map((msg) => {
                      const isFromOther =
                        msg.senderId === activeMatch.otherUser.id;

                      return (
                        <div
                          key={msg.id}
                          className={[
                            "mb-1.5 flex",
                            isFromOther
                              ? "justify-start"
                              : "justify-end",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "max-w-[80%] rounded-2xl px-3 py-1.5 text-[11px]",
                              isFromOther
                                ? "bg-gray-100 text-gray-900"
                                : "bg-emerald-500 text-white",
                            ].join(" ")}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {renderMessageBody(msg.body)}
                            </p>
                            <p
                              className={[
                                "mt-0.5 text-[9px]",
                                isFromOther
                                  ? "text-gray-500"
                                  : "text-white/70",
                              ].join(" ")}
                            >
                              {new Date(msg.createdAt).toLocaleString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                  <div ref={messagesEndRef} />
                </div>

                {/* Composer */}
                {activeMatch && (
                  <>
                    <div className="border-t border-gray-100 px-4 py-2">
                      <button
                        type="button"
                        onClick={handleInterviewInvite}
                        disabled={sending}
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-50 px-3 py-1.5 text-[10px] font-medium text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span>📅</span>
                        <span>Send interview invite</span>
                      </button>
                    </div>
                    <form
                      className="flex items-center gap-2 border-t border-gray-100 px-4 py-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void handleSend();
                      }}
                    >
                      <input
                        type="text"
                        value={sendText}
                        onChange={(e) => setSendText(e.target.value)}
                        placeholder="Type a message…"
                        className="flex-1 rounded-full border border-gray-200 px-3 py-1.5 text-[11px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                      />
                      <button
                        type="submit"
                        disabled={sending || !sendText.trim()}
                        className="inline-flex items-center justify-center rounded-full bg-gray-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {sending ? "…" : "Send"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
