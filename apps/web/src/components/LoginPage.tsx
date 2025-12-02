// apps/web/src/components/LoginPage.tsx
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type Role = "candidate" | "recruiter";
type ProfileMode = "candidate" | "employer" | "both";

type LoginSuccess = {
  ok: true;
  user: {
    id: string;
    email: string;
    role: Role;
    profileMode: ProfileMode;
    emailVerified?: boolean;
  };
};

type LoginError = {
  ok?: false;
  error?: string;
  needsVerification?: boolean;
};

type LoginResponse = LoginSuccess | LoginError;

export default function LoginPage({
  onLogin,
  onShowRegister,
}: {
  onLogin: (
    user: { id: string; role: Role; profileMode: ProfileMode },
    remember: boolean,
  ) => void;
  onShowRegister?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });

      const data = (await res.json().catch(() => null)) as LoginResponse | null;

      // Special case: unverified email
      if (
        res.status === 403 &&
        data &&
        "needsVerification" in data &&
        (data as LoginError).needsVerification
      ) {
        setError(
          data.error ||
            "Please verify your email before signing in. Check your inbox for a verification link.",
        );
        setPassword("");
        setSubmitting(false);
        return;
      }

      const isError =
        !res.ok || data === null || !("ok" in data) || data.ok !== true;

      if (isError) {
        const maybeError = data && "error" in data ? data.error : null;
        setError(
          maybeError ||
            "Invalid email or password. Double-check your details and try again.",
        );
        setPassword("");
        setSubmitting(false);
        return;
      }

      // Success
      setError(null);
      setEmail("");
      setPassword("");
      window.localStorage.setItem(
        "jmp:demo:remember-email",
        remember ? email : "",
      );

      onLogin(
        {
          id: data.user.id,
          role: data.user.role,
          profileMode: data.user.profileMode,
        },
        remember,
      );
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
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-xl font-black text-gray-900 shadow-sm">
            J
          </div>
          <div className="text-sm font-medium text-white/90">
            Job Matching Platform
          </div>
        </div>

        <h1 className="text-xl font-semibold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-white/80">
          Sign in to see your matches and update your profile.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs font-medium text-white/80"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/90 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/40"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-medium text-white/80"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/90 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/40"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 text-white/90">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-white/40 bg-white/20"
              />
              Remember me
            </label>
            <p className="mt-2 text-[11px] text-white/80">
              <Link href="/forgot-password" className="font-medium underline">
                Forgot your password?
              </Link>
            </p>
          </div>

          {error && (
            <p className="text-xs font-medium text-rose-100">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <p className="mt-2 text-center text-xs text-white/80">
            Demo: <span className="font-mono">admin@example.com</span> /{" "}
            <span className="font-mono">password123</span>
          </p>

          {onShowRegister && (
            <p className="mt-3 text-center text-xs text-white/80">
              New here?{" "}
              <button
                type="button"
                onClick={onShowRegister}
                className="font-semibold underline"
              >
                Create an account
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
