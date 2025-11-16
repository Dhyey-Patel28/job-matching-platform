// apps/web/src/app/forgot-password/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import AppBackground from "@/components/AppBackground";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null); // dev-only

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);
    setResetUrl(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? "Something went wrong.");
      }

      setMessage(
        "If an account exists for that email, you'll receive a reset link. (In dev, use the link below.)",
      );

      if (data.resetUrl) {
        setResetUrl(data.resetUrl as string);
      }
    } catch (err) {
      console.error(err);
      setError("Could not process request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AppBackground />
      <div className="grid min-h-screen place-items-center px-4">
        <div className="relative w-[min(500px,92vw)]">
          {/* subtle halo (same as LoginPage) */}
          <div className="absolute -inset-2 rounded-3xl bg-white/10 blur-2xl" />
          <div className="relative rounded-3xl bg-white/10 p-8 backdrop-blur-xl ring-1 ring-white/20 shadow-[0_20px_60px_rgba(0,0,0,.25)]">
            {/* Header brand row (copied from LoginPage for consistency) */}
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-xl font-black text-gray-900 shadow-sm">
                J
              </div>
              <div className="text-sm font-medium text-white/90">
                Job Matching Platform
              </div>
            </div>

            <h1 className="text-xl font-semibold text-white">
              Forgot your password?
            </h1>
            <p className="mt-1 text-sm text-white/80">
              Enter the email you used to sign up. We&apos;ll send you a link to
              reset your password.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/80">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/90 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/40"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <p className="text-xs font-medium text-rose-100">{error}</p>
              )}
              {message && (
                <p className="text-xs font-medium text-emerald-100">
                  {message}
                </p>
              )}

              {resetUrl && (
                <p className="text-[11px] text-white/80">
                  Dev-only reset link:{" "}
                  <Link
                    href={resetUrl}
                    className="font-medium text-white underline"
                  >
                    {resetUrl}
                  </Link>
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px"
              >
                {submitting ? "Sending link…" : "Send reset link"}
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
