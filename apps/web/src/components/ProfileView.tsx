// src/components/ProfileView.tsx
"use client";

import { useEffect, useState } from "react";
import ChatDock from "./ChatDock";

type Role = "candidate" | "recruiter";
type ProfileMode = "candidate" | "employer" | "both";

type CandidateProfile = {
  fullName: string;
  headline: string;
  location: string;
  interests: string;
  resumeUrl: string;
};

type EmployerProfile = {
  companyName: string;
  roleTitle: string;
  location: string;
  website: string;
  hiringFor: string;
};

type JobStatus = "draft" | "open" | "closed";

type EmployerJob = {
  id: string;
  title: string;
  location?: string | null;
  employmentType?: "Full-time" | "Part-time" | "Contract" | "Internship" | null;
  status?: JobStatus | null;
  isPublic?: boolean | null;
};

export default function ProfileView({
  userId,
  userRole,
  profileMode,
  onProfileModeChange,
  onBackToDiscover,
  onLogout,
  emailVerified,
}: {
  userId: string;
  userRole: Role;
  profileMode: ProfileMode;
  onProfileModeChange: (mode: ProfileMode) => void;
  onBackToDiscover: () => void;
  onLogout: () => void;
  emailVerified?: boolean | null;
}) {
  const [candidate, setCandidate] = useState<CandidateProfile>({
    fullName: "",
    headline: "",
    location: "",
    interests: "",
    resumeUrl: "",
  });

  const [employer, setEmployer] = useState<EmployerProfile>({
    companyName: "",
    roleTitle: "",
    location: "",
    website: "",
    hiringFor: "",
  });

  const [activePanel, setActivePanel] = useState<"candidate" | "employer">(
    profileMode === "employer" ? "employer" : "candidate",
  );

  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [topSection, setTopSection] = useState<"profile" | "jobs">("profile");

    // Employer job management
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [creatingJob, setCreatingJob] = useState(false);
  const [newJob, setNewJob] = useState<{
    title: string;
    description: string;
    location: string;
    employmentType: "Full-time" | "Part-time" | "Contract" | "Internship";
    tags: string;
    isPublic: boolean;
    status: JobStatus;
  }>({
    title: "",
    description: "",
    location: "",
    employmentType: "Full-time",
    tags: "",
    isPublic: true,
    status: "open",
  });

  // Hydrate from /api/profile on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/profile");
        const data = (await res.json().catch(() => null)) as
          | {
              ok?: boolean;
              error?: string;
              profile?: {
                profileMode?: ProfileMode;
                candidate?: CandidateProfile | null;
                employer?: EmployerProfile | null;
              } | null;
            }
          | null;

        if (!res.ok || !data?.ok || cancelled) {
          return;
        }

        if (data.profile?.candidate) {
          setCandidate(data.profile.candidate);
        }
        if (data.profile?.employer) {
          setEmployer(data.profile.employer);
        }

        // Keep profileMode in sync with DB the first time we load
        if (
          data.profile?.profileMode &&
          data.profile.profileMode !== profileMode
        ) {
          onProfileModeChange(data.profile.profileMode);
        }
      } catch (err) {
        console.error("Error loading profile in client:", err);
        // Fail silently; user can still type and save
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [userId, profileMode, onProfileModeChange]);

  // Keep activePanel in sync when you go to a single side
  useEffect(() => {
    if (profileMode === "candidate") setActivePanel("candidate");
    if (profileMode === "employer") setActivePanel("employer");
    // when "both", keep the current activePanel as-is
  }, [profileMode]);

    const hasCandidate = profileMode === "candidate" || profileMode === "both";
    const hasEmployer = profileMode === "employer" || profileMode === "both";

    const isRecruiter = userRole === "recruiter";
    const canManageJobs = isRecruiter && hasEmployer;

  const isCandidateVisible =
    hasCandidate && (profileMode !== "both" || activePanel === "candidate");
  const isEmployerVisible =
    hasEmployer && (profileMode !== "both" || activePanel === "employer");


  // Load jobs owned by this employer when employer side is enabled
  useEffect(() => {
    if (!userId || !canManageJobs) {
      setJobs([]);
      return;
    }

    let cancelled = false;

    async function loadJobs() {
      try {
        setJobsLoading(true);
        setJobsError(null);

        const res = await fetch("/api/my-jobs");
        const data = (await res.json().catch(() => null)) as
          | {
              ok?: boolean;
              error?: string;
              jobs?: EmployerJob[];
            }
          | null;

        if (cancelled) return;

        if (!res.ok || !data?.ok || !Array.isArray(data.jobs)) {
          setJobsError(data?.error ?? "Failed to load jobs.");
          setJobs([]);
          return;
        }

        setJobs(data.jobs);
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading jobs in client:", err);
          setJobsError("Could not load jobs.");
          setJobs([]);
        }
      } finally {
        if (!cancelled) {
          setJobsLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, [userId, canManageJobs]);
  
  /**
   * Toggle logic:
   * - candidate-only: clicking Candidate does nothing (can't go to "none")
   * - employer-only: clicking Employer does nothing
   * - candidate-only + click Employer → both
   * - employer-only + click Candidate → both
   * - both + click Candidate → employer-only
   * - both + click Employer → candidate-only
   */
    const toggleCandidate = () => {
    if (profileMode === "candidate") {
      // already candidate-only, don't allow "none"
      return;
    }
    if (profileMode === "employer") {
      onProfileModeChange("both");
      setActivePanel("candidate");
      return;
    }
    // profileMode === "both"
    onProfileModeChange("employer");
    setActivePanel("employer");
  };

  const toggleEmployer = () => {
    if (profileMode === "employer") {
      // already employer-only, don't allow "none"
      return;
    }
    if (profileMode === "candidate") {
      onProfileModeChange("both");
      setActivePanel("employer");
      return;
    }
    // profileMode === "both"
    onProfileModeChange("candidate");
    setActivePanel("candidate");
  };

  const handleCreateJob = async () => {
    if (!userId) return;
    if (!newJob.title.trim()) {
      setErrorMessage("Job title is required.");
      return;
    }

    setCreatingJob(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/my-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newJob.title,
          description: newJob.description,
          location: newJob.location,
          employmentType: newJob.employmentType,
          tags: newJob.tags,
          isPublic: newJob.isPublic,
          status: newJob.status,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | {
            ok?: boolean;
            job?: EmployerJob;
            message?: string;
            error?: string;
          }
        | null;

      if (!res.ok || !data?.ok || !data.job) {
        throw new Error(data?.error ?? "Failed to create job.");
      }

      setJobs((prev) => [data.job as EmployerJob, ...prev]);

      // Reset form
      setNewJob({
        title: "",
        description: "",
        location: "",
        employmentType: "Full-time",
        tags: "",
        isPublic: true,
        status: "open",
      });
    } catch (err) {
      console.error(err);
      setErrorMessage("Could not create job. Please try again.");
    } finally {
      setCreatingJob(false);
    }
  };

  const handleToggleJobStatus = async (job: EmployerJob) => {
    if (!userId || !job.id) return;

    const nextStatus: JobStatus =
      job.status === "open" ? "closed" : "open";

    try {
      const res = await fetch("/api/my-jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          status: nextStatus,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | {
            ok?: boolean;
            job?: EmployerJob;
            error?: string;
          }
        | null;

      if (!res.ok || !data?.ok || !data.job) {
        throw new Error(data?.error ?? "Failed to update job.");
      }

      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, ...data.job } : j)),
      );
    } catch (err) {
      console.error(err);
      setErrorMessage("Could not update job. Please try again.");
    }
  };

  const handleToggleJobVisibility = async (job: EmployerJob) => {
    if (!userId || !job.id) return;

    const nextIsPublic = job.isPublic === false ? true : false;

    try {
      const res = await fetch("/api/my-jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          isPublic: nextIsPublic,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | {
            ok?: boolean;
            job?: EmployerJob;
            error?: string;
          }
        | null;

      if (!res.ok || !data?.ok || !data.job) {
        throw new Error(data?.error ?? "Failed to update job visibility.");
      }

      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, ...data.job } : j)),
      );
    } catch (err) {
      console.error(err);
      setErrorMessage("Could not update job visibility. Please try again.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileMode,
          candidate: hasCandidate ? candidate : null,
          employer: hasEmployer ? employer : null,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string; error?: string }
        | null;

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? "Failed to save profile.");
      }

      setSavedMessage(data.message ?? "Profile saved to database.");
      window.setTimeout(() => setSavedMessage(null), 2000);
    } catch (err) {
      console.error(err);
      setErrorMessage("Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto grid h-[100dvh] max-w-6xl grid-rows-[auto_1fr_auto] gap-3 overflow-visible px-4 py-4">
      {/* Row 1: header */}
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

        {/* Center: label */}
        <div className="justify-self-center">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
            Your profile
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center justify-end gap-2">
          {typeof emailVerified === "boolean" && (
            <span
              className={[
                "rounded-full px-3 py-1 text-[11px] font-medium backdrop-blur border",
                emailVerified
                  ? "border-emerald-400/70 bg-emerald-400/15 text-emerald-100"
                  : "border-amber-400/70 bg-amber-400/15 text-amber-100",
              ].join(" ")}
            >
              {emailVerified ? "Email verified" : "Email not verified"}
            </span>
          )}
          <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
            Signed in as{" "}
            <strong className="ml-1 capitalize">{userRole}</strong>
          </span>

          {/* NEW: chat dock */}
          <ChatDock />

          <button
            type="button"
            onClick={onBackToDiscover}
            className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur transition hover:bg-white/20 active:translate-y-px md:text-sm"
          >
            Back to matches
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

      {/* Row 2: content */}
      <div className="flex items-start justify-center overflow-visible pt-4 md:pt-6">
        <div className="w-full max-w-3xl rounded-3xl bg-white/95 p-6 shadow-lg ring-1 ring-black/5 md:p-8">
          <h1 className="text-xl font-semibold text-gray-900">
            Set up your profile
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Your details are stored for this account in the demo database. Later
            you can plug in real authentication and richer profile fields.
          </p>

          {/* Top-level tabs: Profile / Jobs (for employers) */}
          <div className="mt-4 inline-flex rounded-full bg-gray-900/5 p-1 text-xs">
            <button
              type="button"
              onClick={() => setTopSection("profile")}
              className={[
                "rounded-full px-3 py-1 font-medium transition",
                topSection === "profile"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-200",
              ].join(" ")}
            >
              Profile
            </button>

            {canManageJobs && (
              <button
                type="button"
                onClick={() => setTopSection("jobs")}
                className={[
                  "rounded-full px-3 py-1 font-medium transition",
                  topSection === "jobs"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-200",
                ].join(" ")}
              >
                Jobs
              </button>
            )}
          </div>
          
          {topSection === "profile" && (
            <>
              {/* Role / profile-type config */}
              <div className="mt-4 grid gap-3 rounded-2xl bg-gray-50 p-4 text-xs text-gray-700">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">Profile type</p>
                  <span className="rounded-full bg-gray-900/5 px-2.5 py-1 text-[10px] text-gray-600">
                    Pick one or both
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={toggleCandidate}
                    className={[
                      "inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition",
                      hasCandidate
                        ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400",
                    ].join(" ")}
                    aria-pressed={hasCandidate}
                  >
                    {hasCandidate && (
                      <span className="inline-block h-3 w-3 rounded-full bg-emerald-400" />
                    )}
                    Candidate
                  </button>

                  <button
                    type="button"
                    onClick={toggleEmployer}
                    className={[
                      "inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition",
                      hasEmployer
                        ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400",
                    ].join(" ")}
                    aria-pressed={hasEmployer}
                  >
                    {hasEmployer && (
                      <span className="inline-block h-3 w-3 rounded-full bg-sky-400" />
                    )}
                    Employer
                  </button>
                </div>

                <p className="text-[11px] text-gray-500">
                  This controls what you’ll see in discovery: jobs, employers, or
                  both.
                </p>

                {profileMode === "both" && (
                  <div className="mt-2 flex items-center justify-between rounded-xl bg-white px-3 py-2 text-[11px] text-gray-700">
                    <span className="font-medium">
                      {activePanel === "candidate"
                        ? "Step 1 of 2: Candidate details"
                        : "Step 2 of 2: Employer details"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActivePanel("candidate")}
                        disabled={activePanel === "candidate"}
                        className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 disabled:cursor-default disabled:opacity-50 hover:border-gray-400"
                      >
                        ← Candidate
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePanel("employer")}
                        disabled={activePanel === "employer"}
                        className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 disabled:cursor-default disabled:opacity-50 hover:border-gray-400"
                      >
                        Employer →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-8">
                {/* Candidate section */}
                {isCandidateVisible && (
                  <section aria-label="Candidate profile">
                    <h2 className="text-sm font-semibold text-gray-900">
                      Candidate profile
                    </h2>
                    <p className="mt-1 text-xs text-gray-600">
                      Share what you’re studying / working on, what you’re looking
                      for, and how employers should think about you.
                    </p>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Full name
                        </label>
                        <input
                          type="text"
                          value={candidate.fullName}
                          onChange={(e) =>
                            setCandidate({
                              ...candidate,
                              fullName: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15"
                          placeholder="Alex Student"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Headline
                        </label>
                        <input
                          type="text"
                          value={candidate.headline}
                          onChange={(e) =>
                            setCandidate({
                              ...candidate,
                              headline: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15"
                          placeholder="CS student interested in quant finance and ML"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Location
                        </label>
                        <input
                          type="text"
                          value={candidate.location}
                          onChange={(e) =>
                            setCandidate({
                              ...candidate,
                              location: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15"
                          placeholder="Ypsilanti, MI or Remote"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Resume link (optional)
                        </label>
                        <input
                          type="url"
                          value={candidate.resumeUrl}
                          onChange={(e) =>
                            setCandidate({
                              ...candidate,
                              resumeUrl: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15"
                          placeholder="https://.../resume.pdf"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Interests / skills
                        </label>
                        <textarea
                          value={candidate.interests}
                          onChange={(e) =>
                            setCandidate({
                              ...candidate,
                              interests: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15"
                          placeholder="e.g. React, Spark, options pricing, Rust, algorithms"
                        />
                      </div>
                    </div>
                  </section>
                )}

                {/* Employer section */}
                {isEmployerVisible && (
                  <section aria-label="Employer profile">
                    <h2 className="text-sm font-semibold text-gray-900">
                      Employer profile
                    </h2>
                    <p className="mt-1 text-xs text-gray-600">
                      Tell students who you are hiring for and what makes your team
                      a good fit.
                    </p>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Company name
                        </label>
                        <input
                          type="text"
                          value={employer.companyName}
                          onChange={(e) =>
                            setEmployer({
                              ...employer,
                              companyName: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15"
                          placeholder="Wayfinder Labs"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Your role / title
                        </label>
                        <input
                          type="text"
                          value={employer.roleTitle}
                          onChange={(e) =>
                            setEmployer({
                              ...employer,
                              roleTitle: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15"
                          placeholder="Recruiter, Hiring manager, etc."
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Location
                        </label>
                        <input
                          type="text"
                          value={employer.location}
                          onChange={(e) =>
                            setEmployer({
                              ...employer,
                              location: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15"
                          placeholder="Ann Arbor, MI or Remote"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Company website
                        </label>
                        <input
                          type="url"
                          value={employer.website}
                          onChange={(e) =>
                            setEmployer({
                              ...employer,
                              website: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15"
                          placeholder="https://example.com"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          What roles are you hiring for?
                        </label>
                        <textarea
                          value={employer.hiringFor}
                          onChange={(e) =>
                            setEmployer({
                              ...employer,
                              hiringFor: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15"
                          placeholder="e.g. Summer interns, full-time backend engineers, ML research interns"
                        />
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </>
          )}

          {topSection === "jobs" && canManageJobs && (
            <section aria-label="Employer jobs" className="mt-6">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900">
                      Job postings
                    </h3>
                    <p className="mt-1 text-[11px] text-gray-600">
                      Jobs marked as{" "}
                      <span className="font-medium">open</span> and{" "}
                      <span className="font-medium">public</span> will appear in the
                      main jobs feed for candidates.
                    </p>
                  </div>

                  {/* + New job button */}
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("new-job-form");
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:shadow-md active:translate-y-px"
                  >
                    <span className="text-sm leading-none">＋</span>
                    <span>New job</span>
                  </button>
                </div>

                {jobsError && (
                  <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-medium text-rose-700">
                    {jobsError}
                  </p>
                )}

                {jobs.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {jobs.map((job) => (
                      <li
                        key={job.id}
                        className="flex items-start justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-900">
                            {job.title}
                          </p>
                          <p className="mt-0.5 text-[11px] text-gray-600">
                            {(job.location || "Location TBD") +
                              " · " +
                              (job.employmentType || "Type TBD")}
                          </p>
                        </div>
                        <div className="ml-3 flex flex-col items-end gap-1">
                          <span className="rounded-full bg-gray-900/5 px-2 py-0.5 text-[10px] text-gray-800">
                            {job.status === "draft"
                              ? "Draft"
                              : job.status === "closed"
                              ? "Closed"
                              : "Open"}
                            {job.isPublic === false ? " · Hidden" : ""}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleJobStatus(job)}
                              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-700 hover:border-gray-400"
                            >
                              {job.status === "open" ? "Close job" : "Open job"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleJobVisibility(job)}
                              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-700 hover:border-gray-400"
                            >
                              {job.isPublic === false ? "Make public" : "Hide from feed"}
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-gray-300 bg-white px-3 py-3 text-[11px]">
                    <div>
                      <p className="font-semibold text-gray-900">
                        You haven&apos;t posted any jobs yet.
                      </p>
                      <p className="mt-0.5 text-gray-600">
                        Click <span className="font-medium">＋ New job</span> to create
                        your first posting.
                      </p>
                    </div>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-lg text-gray-500">
                      ＋
                    </span>
                  </div>
                )}

                {/* New job form */}
                <div
                  id="new-job-form"
                  className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white px-3 py-3"
                >
                  <p className="text-[11px] font-semibold text-gray-900">
                    Create a new job
                  </p>

                  <div className="mt-2 grid gap-3 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-[11px] font-medium text-gray-700">
                        Job title
                      </label>
                      <input
                        type="text"
                        value={newJob.title}
                        onChange={(e) =>
                          setNewJob((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900/15"
                        placeholder="Software Engineering Intern"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        value={newJob.location}
                        onChange={(e) =>
                          setNewJob((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900/15"
                        placeholder="Ann Arbor, MI or Remote"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-gray-700">
                        Employment type
                      </label>
                      <select
                        value={newJob.employmentType}
                        onChange={(e) =>
                          setNewJob((prev) => ({
                            ...prev,
                            employmentType: e.target
                              .value as (typeof newJob)["employmentType"],
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900/15"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-[11px] font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        value={newJob.description}
                        onChange={(e) =>
                          setNewJob((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900/15"
                        placeholder="Share what students will work on, required skills, and timeline."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-[11px] font-medium text-gray-700">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={newJob.tags}
                        onChange={(e) =>
                          setNewJob((prev) => ({
                            ...prev,
                            tags: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900/15"
                        placeholder="React, TypeScript, Prisma"
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-wrap gap-3 text-[11px]">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-3 w-3 rounded border-gray-300 text-gray-900"
                          checked={newJob.isPublic}
                          onChange={(e) =>
                            setNewJob((prev) => ({
                              ...prev,
                              isPublic: e.target.checked,
                            }))
                          }
                        />
                        <span className="text-gray-700">
                          Show in jobs feed when open
                        </span>
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-3 w-3 rounded border-gray-300 text-gray-900"
                          checked={newJob.status === "open"}
                          onChange={(e) =>
                            setNewJob((prev) => ({
                              ...prev,
                              status: e.target.checked ? "open" : "draft",
                            }))
                          }
                        />
                        <span className="text-gray-700">
                          Mark as open (students can see it now)
                        </span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateJob}
                    disabled={creatingJob || !newJob.title.trim()}
                    className="mt-3 inline-flex items-center justify-center rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creatingJob ? "Posting…" : "Post job"}
                  </button>
                </div>
              </div>
            </section>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 text-[11px]">
              {errorMessage && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 font-medium text-rose-700">
                  {errorMessage}
                </p>
              )}
              {!errorMessage && savedMessage && (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 font-medium text-emerald-700">
                  {savedMessage}
                </p>
              )}
              {!errorMessage && !savedMessage && (
                <p className="text-gray-500">
                  Your profile is stored for this account in the demo database.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:shadow-md active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 md:text-sm"
            >
              {saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: subtle footer */}
      <div className="pointer-events-none select-none text-center text-[11px] text-white/80">
        Your profile will eventually power smarter matches for job fairs and
        recruiting events.
      </div>
    </div>
  );
}
