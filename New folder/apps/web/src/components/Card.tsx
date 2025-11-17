// src/components/Card.tsx
'use client';
export default function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={[
      "h-full rounded-2xl bg-white/90 shadow-lg backdrop-blur-sm",
      "ring-1 ring-black/5 border border-white/40",
      "transition-transform duration-200 hover:shadow-xl hover:-translate-y-0.5",
      "overflow-hidden",
      className,
    ].join(" ")}>
      {children}
    </div>
  );
}
