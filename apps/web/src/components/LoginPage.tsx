// src/components/LoginPage.tsx
"use client";
import { useState } from "react";

type Role = "candidate" | "recruiter";

export default function LoginPage({ onLogin }: { onLogin: (role: Role, remember: boolean) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("candidate");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const validUsername = "admin";
  const validPassword = "password123";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === validUsername && password === validPassword) {
      setError("");
      onLogin(role, remember);
    } else setError("Invalid username or password");
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
          <div className="text-sm font-medium text-white/90">Job Matching Platform</div>
        </div>

        <h1 className="text-xl font-semibold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-white/80">Sign in and choose your role to tailor the experience.</p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          {/* Role selector */}
          <div className="inline-grid grid-cols-2 overflow-hidden rounded-xl ring-1 ring-white/20 bg-white/10 backdrop-blur">
            {(["candidate","recruiter"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={[
                  "px-4 py-2 text-sm transition",
                  role === r ? "bg-white text-gray-900" : "text-white/90 hover:bg-white/10"
                ].join(" ")}
                aria-pressed={role === r}
              >
                {r[0].toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="username" className="mb-1 block text-xs font-medium text-white/80">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/90 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/40"
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-medium text-white/80">Password</label>
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
            <a href="#" className="text-white/90 underline-offset-2 hover:underline">Forgot password?</a>
          </div>

          {error && <p className="text-sm font-medium text-rose-100">{error}</p>}

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:shadow-md active:translate-y-px"
          >
            Sign in
          </button>

          <p className="text-center text-xs text-white/80 mt-2">
            Demo: <span className="font-mono">admin</span> / <span className="font-mono">password123</span>
          </p>
        </form>
      </div>
    </div>
  );
}
