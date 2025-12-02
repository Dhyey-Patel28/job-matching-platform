// apps/web/src/components/DiscoverView.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import SwipeDeck, { type SwipeDirection } from "@/components/SwipeDeck";
import JobCard, { type Job } from "@/components/JobCard";
import CandidateCard, { type Candidate } from "@/components/CandidateCard";
import { sampleJobs } from "@/data/sample";

type Role = "candidate" | "recruiter";
type ProfileMode = "candidate" | "employer" | "both";

function EndOfDeck({
  total,
  liked,
  noped,
}: {
  total: number;
  liked: number;
  noped: number;
}) {
  const rate = total ? Math.round((liked / total) * 100) : 0;
  return (
    <div className="grid h-full place-items-center">
      <div className="mx-auto rounded-2xl border bg-white/90 p-8 text-center shadow-sm">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          You&apos;re all caught up
        </div>
        <p className="text-sm text-gray-700">
          You&apos;ve reviewed{" "}
          <span className="font-semibold">
            {total} profile{total === 1 ? "" : "s"}
          </span>
          .
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Saved{" "}
          <span className="font-semibold text-emerald-600">{liked}</span>, passed
          on{" "}
          <span className="font-semibold text-rose-500">{noped}</span>.
        </p>
        {total > 0 && (
          <p className="mt-3 text-xs text-gray-500">
            That&apos;s a{" "}
            <span className="font-semibold text-gray-700">{rate}%</span> save
            rate.
          </p>
        )}
      </div>
    </div>
  );
}

export default function DiscoverView({
  userRole,
  profileMode,
  onLogout,
  onEditProfile,
}: {
  userRole: Role | null;
  profileMode: ProfileMode;
  onLogout: () => void;
  onEditProfile: () => void;
}) {
  const [tab, setTab] = useState<"jobs" | "candidates">(
    profileMode === "employer" ? "candidates" : "jobs",
  );
  const [lastAction, setLastAction] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Which decks are allowed for this profile mode?
  const allowedTabs = useMemo<("jobs" | "candidates")[]>(() => {
    if (!userRole) return ["jobs", "candidates"];

    if (profileMode === "both") return ["jobs", "candidates"];
    if (userRole === "candidate") return ["jobs"];
    return ["candidates"];
  }, [userRole, profileMode]);

  // Keep tab in sync with allowedTabs when profileMode / userRole changes
  useEffect(() => {
    if (!allowedTabs.includes(tab)) {
      setTab(allowedTabs[0]);
    }
  }, [allowedTabs, tab]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [jobsRes, candRes] = await Promise.all([
          fetch("/api/jobs"),
          fetch("/api/candidates"),
        ]);

        if (!jobsRes.ok || !candRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const jobsJson = await jobsRes.json();
        const candJson = await candRes.json();

        if (cancelled) return;

        setJobs(
          Array.isArray(jobsJson.jobs) && jobsJson.jobs.length
            ? (jobsJson.jobs as Job[])
            : sampleJobs,
        );
        setCandidates(
          Array.isArray(candJson.candidates) && candJson.candidates.length
            ? (candJson.candidates as Candidate[])
            : [],
        );
      } catch (err) {
        console.error("Falling back to sample data:", err);
        if (cancelled) return;
        setJobs(sampleJobs);
        setCandidates([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // per-deck stats
  const [jobStats, setJobStats] = useState({ liked: 0, noped: 0 });
  const [candidateStats, setCandidateStats] = useState({ liked: 0, noped: 0 });

  const onSwipeJob = (dir: SwipeDirection, item: Job) => {
    setLastAction(
      `${dir === "right" ? "Saved" : "Dismissed"}: ${item.title}`,
    );
    setJobStats((s) => ({
      liked: s.liked + (dir === "right" ? 1 : 0),
      noped: s.noped + (dir === "left" ? 1 : 0),
    }));

    // fire-and-forget – don't block UI on this
    fetch("/api/swipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: "job",
        targetId: item.id,
        direction: dir === "right" ? "right" : "left",
      }),
    }).catch((err) => {
      console.error("Failed to record job swipe:", err);
    });
  };

  const onSwipeCandidate = (dir: SwipeDirection, item: Candidate) => {
    setLastAction(
      `${dir === "right" ? "Saved" : "Dismissed"}: ${item.name}`,
    );
    setCandidateStats((s) => ({
      liked: s.liked + (dir === "right" ? 1 : 0),
      noped: s.noped + (dir === "left" ? 1 : 0),
    }));

    fetch("/api/swipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: "candidate",
        targetId: item.id,
        direction: dir === "right" ? "right" : "left",
      }),
    }).catch((err) => {
      console.error("Failed to record candidate swipe:", err);
    });
  };

  const jobEmpty = (
    <EndOfDeck
      total={jobStats.liked + jobStats.noped}
      liked={jobStats.liked}
      noped={jobStats.noped}
    />
  );

  const candidateEmpty = (
    <EndOfDeck
      total={candidateStats.liked + candidateStats.noped}
      liked={candidateStats.liked}
      noped={candidateStats.noped}
    />
  );
  
  const [activeThread, setActiveThread] = useState<{
    id: string;
    candidateId: string;
    employerId: string;
  } | null>(null);

  // when a match happens:
  async function handleMatch(candidateUserId: string, employerUserId: string) {
    const res = await fetch("/api/chat/thread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateId: candidateUserId,
        employerId: employerUserId,
      }),
    });

    const data = await res.json();
    if (res.ok && data.ok && data.thread) {
      setActiveThread(data.thread);
      // optionally also show your "It's a match!" overlay here
    }
  }

  const showingJobs = tab === "jobs";

  return (
    <div className="mx-auto grid h-[100dvh] max-w-6xl grid-rows-[auto_1fr_auto] gap-3 overflow-visible px-4 py-4">
      {/* Header row */}
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
        {/* Left: logo + label */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-sm font-semibold text-white shadow-sm">
            JP
          </div>
          <div className="hidden text-xs text-white/80 sm:block">
            <div className="font-semibold tracking-wide">Job Playground</div>
            <div className="text-[11px] text-white/60">
              Lightweight swiping for jobs & talent
            </div>
          </div>
        </div>

        {/* Center: role-aware context / tabs */}
        <div className="justify-self-center">
          {allowedTabs.length === 2 ? (
            <div className="inline-flex overflow-hidden rounded-full border border-white/30 bg-white/10 p-1 shadow-sm backdrop-blur">
              <button
                type="button"
                onClick={() => setTab("jobs")}
                className={[
                  "rounded-lg px-4 py-2 text-sm transition",
                  tab === "jobs"
                    ? "bg-white text-gray-900"
                    : "text-white hover:bg-white/10",
                ].join(" ")}
                aria-pressed={tab === "jobs"}
              >
                Candidates: Jobs
              </button>
              <button
                type="button"
                onClick={() => setTab("candidates")}
                className={[
                  "rounded-lg px-4 py-2 text-sm transition",
                  tab === "candidates"
                    ? "bg-white text-gray-900"
                    : "text-white hover:bg-white/10",
                ].join(" ")}
                aria-pressed={tab === "candidates"}
              >
                Recruiters: Candidates
              </button>
            </div>
          ) : (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
              {profileMode === "candidate"
                ? "Discovering jobs tailored to you"
                : profileMode === "employer"
                ? "Discovering candidates tailored to you"
                : "Discovering jobs and candidates"}
            </span>
          )}
        </div>

        {/* Right: user chip + nav + logout */}
        <div className="flex items-center justify-end gap-2">
          {userRole && (
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
              Signed in as{" "}
              <strong className="ml-1 capitalize">{userRole}</strong>
            </span>
          )}
          <button
            type="button"
            onClick={onEditProfile}
            className="rounded-full border border-white/40 px-3 py-1 text-xs font-medium text-white/90 hover:bg-white/10"
          >
            Edit profile
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-900 shadow-sm hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Row 2: deck */}
      <div className="flex items-start justify-center overflow-visible pt-2 md:pt-4">
        {loading ? (
          <div className="py-16 text-sm text-white/80">Loading matches…</div>
        ) : showingJobs ? (
          <SwipeDeck<Job>
            items={jobs ?? sampleJobs}
            onSwipe={onSwipeJob}
            width="clamp(36ch, 42vw, 60ch)"
            controlsInside
            showButtons={false}
            progressVariant="chip"
            emptyState={jobEmpty}
            renderItem={(job) => <JobCard job={job} />}
          />
        ) : (
          <SwipeDeck<Candidate>
            items={candidates ?? []}
            onSwipe={onSwipeCandidate}
            width="clamp(36ch, 42vw, 60ch)"
            controlsInside
            showButtons={false}
            progressVariant="chip"
            emptyState={candidateEmpty}
            renderItem={(candidate) => (
              <CandidateCard candidate={candidate} />
            )}
          />
        )}
      </div>

      {/* Row 3: status bar */}
      <footer className="flex items-center justify-between gap-3 text-xs text-white/70">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[11px]">
            ℹ️
          </span>
          <span className="hidden sm:inline">
            {lastAction
              ? lastAction
              : showingJobs
              ? "Swipe right to save jobs, left to pass."
              : "Swipe right to save candidates, left to pass."}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>
            Jobs – saved{" "}
            <span className="font-semibold text-emerald-300">
              {jobStats.liked}
            </span>
          </span>
          <span>
            Candidates – saved{" "}
            <span className="font-semibold text-sky-300">
              {candidateStats.liked}
            </span>
          </span>
        </div>
      </footer>
    </div>
  );
}
