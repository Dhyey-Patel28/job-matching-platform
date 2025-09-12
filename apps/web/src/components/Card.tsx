'use client';

export default function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        // container
        'h-full rounded-2xl border bg-white/95 shadow-sm transition-all',
        // micro-motion
        'hover:shadow-md hover:-translate-y-0.5',
        // subtle border & surface
        'border-gray-200 backdrop-blur',
        'group', // for child hover styles
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
