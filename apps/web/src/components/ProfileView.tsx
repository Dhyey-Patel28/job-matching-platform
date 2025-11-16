"use client";

import { useEffect, useState } from "react";

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

export default function ProfileView({
  userRole,
  profileMode,
  onProfileModeChange,
  onBackToDiscover,
  onLogout,
}: {
  userRole: Role;
  profileMode: ProfileMode;
  onProfileModeChange: (mode: ProfileMode) => void;
  onBackToDiscover: () => void;
  onLogout: () => void;
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

  // Keep activePanel in sync when you go to a single side
  useEffect(() => {
    if (profileMode === "candidate") setActivePanel("candidate");
    if (profileMode === "employer") setActivePanel("employer");
    // when "both", keep the current activePanel as-is
  }, [profileMode]);

  const hasCandidate =
    profileMode === "candidate" || profileMode === "both";
  const hasEmployer =
    profileMode === "employer" || profileMode === "both";

  const isCandidateVisible =
    hasCandidate && (profileMode !== "both" || activePanel === "candidate");
  const isEmployerVisible =
    hasEmployer && (profileMode !== "both" || activePanel === "employer");

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

      setSavedMessage(
        data.message ??
          "Profile saved (demo backend – not yet persisted to a real DB).",
      );
      window.setTimeout(() => setSavedMessage(null), 2000);
    } catch (err) {
      console.error(err);
      setErrorMessage(
        "Could not save profile. This is a demo backend – wire it to your DB later.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto grid h-[100dvh] max-w-6xl grid-rows-[auto_1fr_auto] gap-3 px-4 py-4 overflow-visible">
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
          <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
            Signed in as{" "}
            <strong className="ml-1 capitalize">{userRole}</strong>
          </span>
          <button
            type="button"
            onClick={onBackToDiscover}
            className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs md:text-sm text-white backdrop-blur transition hover:bg-white/20 active:translate-y-px"
          >
            Back to matches
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs md:text-sm text-white backdrop-blur transition hover:bg-white/20 active:translate-y-px"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Row 2: content */}
      <div className="flex items-start justify-center pt-4 md:pt-6 overflow-visible">
        <div className="w-full max-w-3xl rounded-3xl bg-white/95 p-6 md:p-8 shadow-lg ring-1 ring-black/5">
          <h1 className="text-xl font-semibold text-gray-900">
            Set up your profile
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            This is just the front-end shell. Later we’ll connect this to a real
            database so students and employers can save rich profiles, resumes,
            and photos.
          </p>

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
              both. You can tweak it later without losing your details.
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
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 disabled:opacity-50 disabled:cursor-default hover:border-gray-400"
                  >
                    ← Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePanel("employer")}
                    disabled={activePanel === "employer"}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 disabled:opacity-50 disabled:cursor-default hover:border-gray-400"
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
                        setCandidate({ ...candidate, fullName: e.target.value })
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
                        setCandidate({ ...candidate, headline: e.target.value })
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
                        setCandidate({ ...candidate, location: e.target.value })
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
                  Nothing is persisted yet — this just hits a demo API for now.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-sm transition hover:shadow-md active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
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
