// src/components/Splash.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type SplashProps = {
  onFinish: () => void;
  logoSrc?: string;
  brand?: string;
  duration?: { hold?: number; fadeOut?: number };
  gradientClassName?: string;
};

export default function Splash({
  onFinish,
  logoSrc,
  brand = "Job Match",
  duration,
  gradientClassName = "bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-400",
}: SplashProps) {
  // Show immediately, then fade out
  const [out, setOut] = useState(false);

  const { hold, fadeOut } = useMemo(() => {
    const d = duration ?? {
      hold: process.env.NODE_ENV === "development" ? 600 : 900,
      fadeOut: 500,
    };
    return { hold: d.hold ?? 900, fadeOut: d.fadeOut ?? 500 };
  }, [duration]);

  useEffect(() => {
    const t1 = window.setTimeout(() => setOut(true), hold);
    const t2 = window.setTimeout(onFinish, hold + fadeOut);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [hold, fadeOut, onFinish]);

  const monogram = useMemo(() => {
    const parts = brand.trim().split(/\s+/);
    const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
    return (letters || "JM").toUpperCase();
  }, [brand]);

  return (
    <div
      aria-hidden="true"
      className={[
        "fixed inset-0 z-[999] flex items-center justify-center",
        "transition-opacity",
        gradientClassName,
        out ? "opacity-0 pointer-events-none" : "opacity-100",
      ].join(" ")}
      style={{ transitionDuration: `${fadeOut}ms` }}
    >
      {/* Subtle glows */}
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-16 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

      <div
        className={[
          "grid place-items-center rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur",
          "transition-transform",
        ].join(" ")}
        style={{ transitionDuration: `${fadeOut}ms`, transform: `scale(${out ? 1.1 : 1})` }}
      >
        {logoSrc ? (
          <Image
            src={logoSrc}
            alt={brand}
            width={160}
            height={160}
            priority
            className="h-20 w-20 object-contain"
          />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-xl bg-white text-3xl font-black text-gray-900 shadow-sm ring-1 ring-black/5">
            {monogram}
          </div>
        )}
        <p className="mt-3 select-none text-sm font-medium tracking-wide text-gray-900/80">
          {brand}
        </p>
      </div>
    </div>
  );
}
