// src/components/JobCard.tsx
'use client';
import { useMemo } from 'react';
import Card from './Card';

function initials(name: string) {
  return name.split(/\s+/).map(s => s[0]).join('').slice(0,2).toUpperCase();
}

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  tags?: string[];
  postedAt?: string;
  summary?: string;
  experienceLevel?: 'Intern' | 'Junior' | 'Mid' | 'Senior' | 'Lead';
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
};

export default function JobCard({
  job,
  /** Feed the signed-in user’s skills for a real signal (fallbacks to a sane set). */
  mySkills = ['React', 'TypeScript', 'Node.js', 'Postgres', 'Tailwind'],
}: {
  job: Job;
  mySkills?: string[];
}) {
  const match = useMemo(() => {
    const mine = new Set(mySkills.map(s => s.toLowerCase()));
    const tech = (job.tags ?? []).map(s => s.toLowerCase());
    const hits = tech.filter(t => mine.has(t)).length;
    const pct = tech.length ? Math.round((hits / tech.length) * 100) : 0;
    // Put the most relevant tags first.
    const sorted = (job.tags ?? []).slice().sort((a, b) => {
      const A = mine.has(a.toLowerCase()) ? 1 : 0;
      const B = mine.has(b.toLowerCase()) ? 1 : 0;
      return B - A || a.localeCompare(b);
    });
    return { hits, total: tech.length, pct, highlights: sorted.slice(0, 3) };
  }, [job.tags, mySkills]);

  return (
    <Card className="flex h-full flex-col p-5">
      {/* Top: title + company */}
      <div className="flex items-start justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-sm font-semibold shadow-sm ring-1 ring-gray-200">
            {initials(job.company)}
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight">{job.title}</h3>
            <p className="text-xs text-gray-600">{job.company} · {job.location}</p>
          </div>
        </div>
        {job.salary && (
          <span className="rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs font-medium">
            {job.salary}
          </span>
        )}
      </div>

      <div className="h-px w-full bg-gradient-to-r from-gray-200/70 to-transparent" />

      {/* Two-column on wide cards: content + compact stats rail */}
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_auto]">
        {/* Main column */}
        <div>
          {/* Meta chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
            {job.experienceLevel && (
              <span className="rounded-full border border-gray-200 bg-white/70 px-2 py-1">
                {job.experienceLevel}
              </span>
            )}
            {job.employmentType && (
              <span className="rounded-full border border-gray-200 bg-white/70 px-2 py-1">
                {job.employmentType}
              </span>
            )}
          </div>

          {/* Summary */}
          {job.summary && (
            <p className="mt-3 text-sm text-gray-700">
              {job.summary}
            </p>
          )}

          {/* Match bar (fast signal) */}
          <div
            className="mt-3 flex items-center gap-2"
            role="meter"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={match.pct}
            aria-label="Skills match"
          >
            <div className="h-1.5 w-[46%] rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${match.pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">{match.pct}% skills match</span>
          </div>

          {/* Highlights (top 3) */}
          {match.highlights.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {match.highlights.map(t => (
                <span
                  key={t}
                  className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right rail — shows on wider cards */}
        <aside className="hidden md:flex min-w-[7.5rem] flex-col items-end gap-3">
          {/* Circular match ring */}
          <div
            className="relative h-12 w-12 rounded-full"
            style={{
              background: `conic-gradient(#10b981 ${match.pct}%, #e5e7eb 0)`,
            }}
            role="img"
            aria-label={`${match.pct}% skills match`}
          >
            <div className="absolute inset-1 rounded-full bg-white/90 grid place-items-center text-[10px] font-medium text-gray-700">
              {match.pct}%
            </div>
          </div>
          {job.postedAt && (
            <span className="text-[11px] text-gray-500">Posted {job.postedAt}</span>
          )}
        </aside>
      </div>

      {/* Footer actions */}
      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="text-xs text-transparent">.</span>
        <div className="flex gap-2">
          <button
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:shadow-sm active:translate-y-px"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => console.log('Save clicked', job.id)}
          >
            ☆ Save
          </button>
          <button
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white hover:shadow-sm active:translate-y-px"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => console.log('View details', job.id)}
          >
            View details
          </button>
        </div>
      </div>
    </Card>
  );
}
