// src/components/LoginPage.tsx
"use client";

import { useState, type FormEvent } from "react";

type Role = "candidate" | "recruiter";
type ProfileMode = "candidate" | "employer" | "both";

type LoginSuccess = {
  ok: true;
  user: {
    id: string;
    email: string;
    role: Role;
    profileMode: ProfileMode;
  };
  remember: boolean;
  token?: string;
};

type LoginError = {
  ok?: false;
  error?: string;
};

type LoginResponse = LoginSuccess | LoginError;

export default function LoginPage({
  onLogin,
}: {
  onLogin: (
    user: { role: Role; profileMode: ProfileMode },
    remember: boolean
  ) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json().catch(() => null)) as LoginResponse | null;

      const isError =
        !res.ok || data === null || !("ok" in data) || data.ok !== true;

      if (isError) {
        const errorMessage =
          data && "error" in data && data.error
            ? data.error
            : "Failed to sign in. Please try again.";
        setError(errorMessage);
        return;
      }

      // success – let parent know (role + profileMode from backend)
      onLogin(
        {
          role: data.user.role,
          profileMode: data.user.profileMode,
        },
        remember
      );
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
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
            <a
              href="#"
              className="text-white/90 underline-offset-2 hover:underline"
            >
              Forgot password?
            </a>
          </div>

          {error && (
            <p className="text-sm font-medium text-rose-100">{error}</p>
          )}

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:shadow-md active:translate-y-px"
          >
            Sign in
          </button>

          <p className="text-center text-xs text-white/80 mt-2">
            Demo: <span className="font-mono">admin@example.com</span> /{" "}
            <span className="font-mono">password123</span>
          </p>
        </form>
      </div>
    </div>
  );
}
