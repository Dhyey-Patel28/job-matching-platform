// src/components/RegisterCard.tsx
"use client";

import { useState, type FormEvent } from "react";

type ProfileMode = "candidate" | "employer" | "both";

export default function RegisterCard({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [profileMode, setProfileMode] = useState<ProfileMode>("candidate");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd, profileMode }),
      });

      const data = (await res.json().catch(() => null)) as
        | {
            ok?: boolean;
            message?: string;
            error?: string;
          }
        | null;

      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Failed to register. Please try again.");
        return;
      }

      setMessage(
        data.message ??
          "Registration accepted (demo). You can go back to the login screen.",
      );

      // Optional: automatically go back after a short delay
      setTimeout(() => onBack(), 1200);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-[420px] rounded-2xl border bg-white/95 p-8 shadow-sm">
      <h1 className="text-xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-1 text-sm text-gray-600">
        This is a placeholder. Hook this up to your backend when ready.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            placeholder="••••••••"
            required
          />
        </div>

        {/* Profile type selector */}
        <div className="mt-4">
          <p className="mb-1 text-xs font-medium text-gray-700">Profile type</p>
          <div className="inline-flex overflow-hidden rounded-xl border border-gray-200 bg-white p-1 text-xs">
            {[
              { key: "candidate", label: "Candidate" },
              { key: "employer", label: "Employer" },
              { key: "both", label: "Both" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setProfileMode(opt.key as ProfileMode)}
                className={[
                  "rounded-lg px-3 py-1 font-medium transition",
                  profileMode === opt.key
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100",
                ].join(" ")}
                aria-pressed={profileMode === opt.key}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            This controls what you’ll see in discovery: jobs, employers, or
            both. You can tweak it later on your profile.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Creating account…" : "Sign up"}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 transition hover:shadow-sm active:translate-y-px"
        >
          Back to login
        </button>
      </form>
    </div>
  );
}
