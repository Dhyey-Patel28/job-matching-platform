// apps/web/src/app/reset-password/page.tsx
"use client";

import { Suspense } from "react";
import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AppBackground from "@/components/AppBackground";

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError("Missing reset token. Use the link from your email.");
      return;
    }

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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? "Something went wrong.");
      }

      setMessage("Your password has been reset. You can now sign in.");
      setPassword("");
      setConfirm("");
    } catch (err) {
      console.error(err);
      setError("Could not reset password. The link may be invalid or expired.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AppBackground />
      <div className="grid min-h-screen place-items-center px-4">
        <div className="relative w-[min(500px,92vw)]">
          <div className="absolute -inset-2 rounded-3xl bg-white/10 blur-2xl" />
          <div className="relative rounded-3xl bg-white/10 p-8 backdrop-blur-xl ring-1 ring-white/20 shadow-[0_20px_60px_rgba(0,0,0,.25)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-xl font-black text-gray-900 shadow-sm">
                J
              </div>
              <div className="text-sm font-medium text-white/90">
                Job Matching Platform
              </div>
            </div>

            <h1 className="text-xl font-semibold text-white">
              Reset your password
            </h1>
            <p className="mt-1 text-sm text-white/80">
              Choose a new password for your account.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
              noValidate
            >
              {!token && (
                <p className="text-xs font-medium text-rose-100">
                  No reset token was provided. Please use the link from your
                  email or request a new one.
                </p>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-white/80">
                  New password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/90 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/40"
                  placeholder="Re-type your password"
                />
              </div>

              {error && (
                <p className="text-xs font-medium text-rose-100">{error}</p>
              )}
              {!error && message && (
                <p className="text-xs font-medium text-emerald-100">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !token}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px"
              >
                {submitting ? "Saving…" : "Save new password"}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-white/80">
              <Link href="/" className="font-medium underline">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-slate-950 px-4">
          <div className="text-sm text-white/70">
            Loading reset password…
          </div>
        </main>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}