// apps/web/src/app/reset-password/page.tsx
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppBackground from "@/components/AppBackground";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError("Missing reset token. Please use the link from your email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
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
        throw new Error(data?.error ?? "Failed to reset password.");
      }

      setMessage(
        "Password updated. Redirecting you back to login with your new password…",
      );

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(
        "Could not reset password. The link may be invalid or expired.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AppBackground />
      <div className="grid min-h-screen place-items-center px-4">
        <div className="w-[420px] max-w-full rounded-2xl border border-black/5 bg-white/95 p-6 shadow-lg">
          <h1 className="text-lg font-semibold text-gray-900">
            Reset your password
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Choose a new password for your account.
          </p>

          {!token && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
              Missing or invalid reset token. Please use the link from your
              reset email.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15"
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-rose-600">{error}</p>
            )}
            {message && (
              <p className="text-xs font-medium text-emerald-600">{message}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !token}
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Updating password…" : "Update password"}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-gray-500">
            <Link href="/" className="font-medium text-gray-700 underline">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
