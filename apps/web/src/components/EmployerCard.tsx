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
  return (
    <Card className="flex h-full flex-col p-5">
      {/* Header */}
      <div className="flex items-start justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-sm font-semibold shadow-sm ring-1 ring-gray-200">
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

      {/* Rating */}
      {typeof employer.rating === 'number' && (
        <div className="mt-2 text-xs text-gray-700">
          <span className="mr-1">★</span>{employer.rating.toFixed(1)}/5
        </div>
      )}

      {/* About */}
      {employer.about && <p className="mt-3 text-sm text-gray-700">{employer.about}</p>}

      {/* Benefits */}
      {employer.benefits?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {employer.benefits.map(b => (
            <span key={b} className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700">
              {b}
            </span>
          ))}
        </div>
      ) : null}

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
