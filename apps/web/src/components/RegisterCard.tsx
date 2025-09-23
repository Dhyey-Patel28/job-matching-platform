// src/components/RegisterCard.tsx
"use client";

import { useState } from "react";

export default function RegisterCard({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  const fakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to backend later
    alert("Account creation is a placeholder. Going back to login.");
    onBack();
  };

  return (
    <div className="w-[420px] rounded-2xl border bg-white/95 p-8 shadow-sm">
      <h1 className="text-xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-1 text-sm text-gray-600">
        This is a placeholder. Hook this up to your backend when ready.
      </p>

      <form onSubmit={fakeSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Email</label>
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
          <label className="mb-1 block text-xs font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:shadow-sm active:translate-y-px"
        >
          Sign up
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
