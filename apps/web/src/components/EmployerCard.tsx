// src/components/EmployerCard.tsx
'use client';
import Card from './Card';

function initials(name: string) {
  return name.split(/\s+/).map(s => s[0]).join('').slice(0,2).toUpperCase();
}

export type Employer = {
  id: string;
  name: string;
  industry: string;
  openRoles: number;
  rating?: number;
  location?: string;
  about?: string;
  benefits?: string[];
  website?: string;
};

export default function EmployerCard({ employer }: { employer: Employer }) {
  const topBenefits = (employer.benefits ?? []).slice(0, 3);

  // --- derived badges (no new fields)
  const rating = employer.rating ?? null;
  const topRated = rating !== null && rating >= 4.6;
  const wellLoved = rating !== null && rating >= 4.3 && rating < 4.6;
  const hiringFast = employer.openRoles >= 4;
  const remoteFriendly =
    /remote/i.test(employer.location ?? '') ||
    (employer.benefits ?? []).some(b => /remote/i.test(b));

  return (
    <Card className="flex h-full flex-col p-5">
      {/* Header */}
      <div className="flex items-start justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-sm font-semibold shadow-sm ring-1 ring-gray-200">
            {initials(employer.name)}
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight">{employer.name}</h3>
            <p className="text-xs text-gray-600">
              {employer.industry}{employer.location ? ` · ${employer.location}` : ''}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs font-medium">
          {employer.openRoles} open
        </span>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-gray-200/70 to-transparent" />

      {/* Two-column on wide cards */}
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_auto]">
        {/* Left: about + benefits */}
        <div>
          {rating !== null && (
            <div className="text-xs text-gray-700" aria-label={`Rating ${rating.toFixed(1)} out of 5`}>
              <span aria-hidden>★</span> {rating.toFixed(1)}/5
            </div>
          )}

          {employer.about && (
            <p className="mt-3 text-sm text-gray-700">{employer.about}</p>
          )}

          {topBenefits.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {topBenefits.map(b => (
                <span key={b} className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700">
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: compact dynamic badges */}
        <aside className="hidden md:flex min-w-[9rem] flex-col items-end gap-2">
          {topRated && (
            <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
              Top rated
            </span>
          )}
          {!topRated && wellLoved && (
            <span className="rounded-lg bg-sky-50 px-2 py-1 text-[11px] font-medium text-sky-700">
              Well-loved
            </span>
          )}
          {hiringFast && (
            <span className="rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
              Hiring fast
            </span>
          )}
          {remoteFriendly && (
            <span className="rounded-lg bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-700">
              Remote friendly
            </span>
          )}
        </aside>
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-end gap-2 pt-4">
        <a
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:shadow-sm active:translate-y-px"
          onPointerDown={(e) => e.stopPropagation()}
          href={employer.website || '#'}
          target="_blank"
          rel="noreferrer"
        >
          Website
        </a>
        <button
          className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white hover:shadow-sm active:translate-y-px"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => console.log('Follow company', employer.id)}
        >
          Follow
        </button>
      </div>
    </Card>
  );
}
