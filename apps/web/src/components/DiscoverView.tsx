// apps/web/src/components/DiscoverView.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import SwipeDeck, { type SwipeDirection } from "@/components/SwipeDeck";
import EmployerCard, { type Employer } from "@/components/EmployerCard";
import JobCard, { type Job } from "@/components/JobCard";
import { sampleEmployers, sampleJobs } from "@/data/sample";

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
        <div className="mb-1 text-3xl">🎉</div>
        <h3 className="text-xl font-semibold">You’re all caught up!</h3>
        <p className="mt-1 text-sm text-gray-600">
          Nice work — here’s how you did.
        </p>

        <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-4">
          <div className="rounded-xl border bg-white px-4 py-3">
            <div className="text-lg font-semibold">{total}</div>
            <div className="text-[11px] text-gray-600">Reviewed</div>
          </div>
          <div className="rounded-xl border bg-white px-4 py-3">
            <div className="text-lg font-semibold">{liked}</div>
            <div className="text-[11px] text-gray-600">Saved</div>
          </div>
          <div className="rounded-xl border bg-white px-4 py-3">
            <div className="text-lg font-semibold">{noped}</div>
            <div className="text-[11px] text-gray-600">Dismissed</div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-700">
          Save rate: <span className="font-medium">{rate}%</span>
        </div>
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
  const [tab, setTab] = useState<"jobs" | "employers">(
    profileMode === "employer" ? "employers" : "jobs",
  );
  const [lastAction, setLastAction] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [employers, setEmployers] = useState<Employer[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Which decks are allowed for this profile mode?
  const allowedTabs = useMemo<("jobs" | "employers")[]>(() => {
    if (!userRole) return ["jobs", "employers"];

    if (profileMode === "both") return ["jobs", "employers"];
    if (userRole === "candidate") return ["jobs"];
    return ["employers"];
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
        const [jobsRes, empRes] = await Promise.all([
          fetch("/api/jobs"),
          fetch("/api/employers"),
        ]);

        if (!jobsRes.ok || !empRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const jobsJson = await jobsRes.json();
        const empJson = await empRes.json();

        if (cancelled) return;

        setJobs(
          Array.isArray(jobsJson.jobs) && jobsJson.jobs.length
            ? (jobsJson.jobs as Job[])
            : sampleJobs,
        );
        setEmployers(
          Array.isArray(empJson.employers) && empJson.employers.length
            ? (empJson.employers as Employer[])
            : sampleEmployers,
        );
      } catch (err) {
        console.error("Falling back to sample data:", err);
        if (cancelled) return;
        setJobs(sampleJobs);
        setEmployers(sampleEmployers);
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
  const [empStats, setEmpStats] = useState({ liked: 0, noped: 0 });

  const onSwipeJob = (dir: SwipeDirection, item: Job) => {
    setLastAction(
      `${dir === "right" ? "Saved" : "Dismissed"}: ${item.title}`,
    );
    setJobStats((s) => ({
      liked: s.liked + (dir === "right" ? 1 : 0),
      noped: s.noped + (dir === "left" ? 1 : 0),
    }));
  };

  const onSwipeEmployer = (dir: SwipeDirection, item: Employer) => {
    setLastAction(
      `${dir === "right" ? "Saved" : "Dismissed"}: ${item.name}`,
    );
    setEmpStats((s) => ({
      liked: s.liked + (dir === "right" ? 1 : 0),
      noped: s.noped + (dir === "left" ? 1 : 0),
    }));
  };

  const jobEmpty = (
    <EndOfDeck
      total={jobStats.liked + jobStats.noped}
      liked={jobStats.liked}
      noped={jobStats.noped}
    />
  );
  const empEmpty = (
    <EndOfDeck
      total={empStats.liked + empStats.noped}
      liked={empStats.liked}
      noped={empStats.noped}
    />
  );

  const showingJobs = tab === "jobs";

  return (
    <div className="mx-auto grid h-[100dvh] max-w-6xl grid-rows-[auto_1fr_auto] gap-3 overflow-visible px-4 py-4">
      {/* Row 1: compact toolbar + centered context */}
      <header className="grid grid-cols-[1fr_auto_1fr] items-center">
        {/* Left: brand */}
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[0.9rem] font-black text-gray-900 shadow-sm">
            J
          </div>
          <span className="text-sm font-medium text-white/90">
            Job Matching Platform
          </span>
        </div>

        {/* Center: role-aware context / tabs */}
        <div className="justify-self-center">
          {allowedTabs.length === 2 ? (
            <div className="inline-flex overflow-hidden rounded-xl border border-white/30 bg-white/10 p-1 shadow-sm backdrop-blur">
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
                onClick={() => setTab("employers")}
                className={[
                  "rounded-lg px-4 py-2 text-sm transition",
                  tab === "employers"
                    ? "bg-white text-gray-900"
                    : "text-white hover:bg-white/10",
                ].join(" ")}
                aria-pressed={tab === "employers"}
              >
                Recruiters: Employers
              </button>
            </div>
          ) : (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
              {profileMode === "candidate"
                ? "Discovering jobs tailored to you"
                : profileMode === "employer"
                ? "Discovering employers and teams"
                : "Discovering jobs and employers"}
            </span>
          )}
        </div>

        {/* Right: user chip + nav + logout */}
        <div className="flex items-center justify-end gap-2">
          {userRole && (
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
              Signed in as{" "}
              <strong className="ml-1 capitalize">{userRole}</strong>
            </span>
          )}
          <button
            type="button"
            onClick={onEditProfile}
            className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur transition hover:bg-white/20 active:translate-y-px md:text-sm"
          >
            Profile
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur transition hover:bg-white/20 active:translate-y-px md:text-sm"
          >
            Log out
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
          <SwipeDeck<Employer>
            items={employers ?? sampleEmployers}
            onSwipe={onSwipeEmployer}
            width="clamp(36ch, 42vw, 60ch)"
            controlsInside
            showButtons={false}
            progressVariant="chip"
            emptyState={empEmpty}
            renderItem={(employer) => <EmployerCard employer={employer} />}
          />
        )}
      </div>

      {/* Row 3: status */}
      <div className="pointer-events-none select-none text-center text-sm text-white/90">
        {lastAction ? lastAction : "Tip: drag or use ← / → (A / D)."}
      </div>
    </div>
  );
}
