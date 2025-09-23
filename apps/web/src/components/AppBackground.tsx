// src/components/AppBackground.tsx
"use client";

export default function AppBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base brand gradient, but softened */}
      <div className="absolute inset-0 opacity-80 
        bg-[radial-gradient(1200px_800px_at_-10%_-10%,#fb7185,transparent_60%),radial-gradient(1000px_900px_at_110%_110%,#f59e0b,transparent_55%),linear-gradient(180deg,#7c3aed,#ec4899_40%,#f59e0b)]" 
      />
      {/* Gentle white radial highlights to mute saturation */}
      <div className="absolute inset-0 mix-blend-soft-light opacity-60 
        [background:radial-gradient(700px_350px_at_20%_18%,rgba(255,255,255,.18),transparent),radial-gradient(800px_400px_at_82%_82%,rgba(255,255,255,.14),transparent)]" 
      />
      {/* Subtle grid/noise (pure CSS) */}
      <div className="absolute inset-0 opacity-[.05] 
        [background:repeating-linear-gradient(0deg,rgba(255,255,255,.4)_0,rgba(255,255,255,.4)_1px,transparent_1px,transparent_2px),repeating-linear-gradient(90deg,rgba(255,255,255,.4)_0,rgba(255,255,255,.4)_1px,transparent_1px,transparent_2px)]" 
      />
      {/* Soft vignette so content pops */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(1000px_600px_at_50%_120%,rgba(0,0,0,.25),transparent_60%)]" />
    </div>
  );
}
