"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type ProfileMode = "candidate" | "employer" | "both";

type RegisterResponse =
  | {
      ok: true;
      message?: string;
      verifyUrl?: string;
    }
  | {
      ok?: false;
      error?: string;
    };

export default function RegisterCard({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [profileMode, setProfileMode] = useState<ProfileMode>("candidate");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, profileMode }),
      });

      const data = (await res.json().catch(() => null)) as
        | RegisterResponse
        | null;

      if (!res.ok || !data || !("ok" in data) || data.ok !== true) {
        const msg =
          (data && "error" in data && data.error) ||
          "Could not create account. Please try again.";
        setError(msg);
        return;
      }

      setMessage(
        data.message ??
          "Account created. Please check your email to verify your address.",
      );

      // Optionally reset fields
      setEmail("");
      setPassword("");
      setConfirm("");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative w-[min(500px,92vw)]">
      {/* subtle halo */}
      <div className="absolute -inset-2 rounded-3xl bg-white/10 blur-2xl" />
      <div className="relative rounded-3xl bg-white/10 p-8 backdrop-blur-xl ring-1 ring-white/20 shadow-[0_20px_60px_rgba(0,0,0,.25)]">
        {/* Header brand row (match LoginPage) */}
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-xl font-black text-gray-900 shadow-sm">
            J
          </div>
          <div className="text-sm font-medium text-white/90">
            Job Matching Platform
          </div>
        </div>

        <h1 className="text-xl font-semibold text-white">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-white/80">
          Tell us how you plan to use Job Matching so we can tailor your
          experience.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-xs font-medium text-white/80">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-white/20 bg-white/90 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/40"
              placeholder="you@example.com"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-white/80">
                Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-white/20 bg-white/90 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/40"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-white/80">
                Confirm password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full rounded-lg border border-white/20 bg-white/90 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/40"
                placeholder="Re-type your password"
              />
            </div>
          </div>

          <div className="mt-2 space-y-2 rounded-2xl bg-white/5 p-3">
            <p className="text-xs font-medium text-white/90">
              How will you use Job Matching?
            </p>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setProfileMode("candidate")}
                className={[
                  "rounded-lg border px-3 py-1.5 font-medium transition",
                  profileMode === "candidate"
                    ? "border-white bg-white text-gray-900 shadow-sm"
                    : "border-white/30 bg-white/5 text-white/80 hover:border-white/60",
                ].join(" ")}
              >
                I’m a candidate
              </button>
              <button
                type="button"
                onClick={() => setProfileMode("employer")}
                className={[
                  "rounded-lg border px-3 py-1.5 font-medium transition",
                  profileMode === "employer"
                    ? "border-white bg-white text-gray-900 shadow-sm"
                    : "border-white/30 bg-white/5 text-white/80 hover:border-white/60",
                ].join(" ")}
              >
                I’m hiring
              </button>
              <button
                type="button"
                onClick={() => setProfileMode("both")}
                className={[
                  "rounded-lg border px-3 py-1.5 font-medium transition",
                  profileMode === "both"
                    ? "border-white bg-white text-gray-900 shadow-sm"
                    : "border-white/30 bg-white/5 text-white/80 hover:border-white/60",
                ].join(" ")}
              >
                Both
              </button>
            </div>
            <p className="text-[11px] text-white/70">
              You can change this later from your profile.
            </p>
          </div>

          {error && (
            <p className="text-xs font-medium text-rose-100">{error}</p>
          )}
          {!error && message && (
            <p className="text-xs font-medium text-emerald-100">{message}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>

          <div className="mt-3 flex items-center justify-between text-xs text-white/80">
            <button
              type="button"
              onClick={onBack}
              className="underline decoration-white/50 underline-offset-2"
            >
              Back to sign in
            </button>
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={onBack}
                className="font-semibold underline"
              >
                Sign in
              </button>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
